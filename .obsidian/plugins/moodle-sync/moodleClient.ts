import { requestUrl } from "obsidian";

export interface MoodleCourse {
	id: number;
	shortname: string;
	fullname: string;
}

export interface MoodleFile {
	filename: string;
	fileurl: string;
	filesize: number;
	timemodified: number; // unix seconds
	// relative path within the course section, if the course used folders
	filepath?: string;
}

export interface MoodleModuleContent {
	id: number; // Moodle section id — stable even if the section is renamed
	name: string; // section/module name in Moodle, e.g. "Wireless Device Security"
	files: MoodleFile[];
}

export interface MoodleAssignment {
	id: number;
	name: string; // e.g. "Tutorial 01 - OS Research"
	courseModuleId: number; // "cmid" — matches the module id used in section.modules
	files: MoodleFile[]; // files attached to the assignment's own instructions, not student submissions
}

const SERVICE_SHORTNAME = "moodle_mobile_app";

/**
 * Thin wrapper around the subset of the Moodle Web Services REST API
 * this plugin needs: authenticate, list courses, list course contents,
 * download a file. Deliberately minimal — not a general Moodle SDK.
 */
export class MoodleClient {
	private baseUrl: string;
	private token: string | null = null;
	// Populated by getCourseFiles(); maps a course-module id (cmid) to the
	// section it lives in, so getAssignmentFiles() can attribute assignment
	// attachments back to the right module without a second full course walk.
	private lastCourseModuleToSection = new Map<number, { id: number; name: string }>();

	constructor(baseUrl: string) {
		// normalise: strip trailing slash
		this.baseUrl = baseUrl.replace(/\/+$/, "");
	}

	/** Exchange username/password for a web service token. Throws on failure. */
	async login(username: string, password: string): Promise<string> {
		const token = await MoodleClient.fetchToken(this.baseUrl, username, password);
		this.token = token;
		return token;
	}

	/**
	 * Standalone token fetch — does not require an existing MoodleClient instance
	 * or mutate one. Used by the settings UI to let the user generate a token
	 * once, view/copy it, and store that instead of their raw password.
	 */
	static async fetchToken(baseUrl: string, username: string, password: string): Promise<string> {
		const normalised = baseUrl.replace(/\/+$/, "");
		const url = `${normalised}/login/token.php?username=${encodeURIComponent(
			username
		)}&password=${encodeURIComponent(password)}&service=${SERVICE_SHORTNAME}`;

		const res = await requestUrl({ url, method: "GET" });
		const body = res.json;

		if (body.error) {
			throw new Error(`Moodle login failed: ${body.error}`);
		}
		if (!body.token) {
			throw new Error("Moodle login did not return a token. Check the site URL and that web services are enabled.");
		}
		return body.token;
	}

	setToken(token: string) {
		this.token = token;
	}

	private requireToken(): string {
		if (!this.token) {
			throw new Error("MoodleClient has no token — call login() or setToken() first.");
		}
		return this.token;
	}

	private async callFunction(wsfunction: string, params: Record<string, string> = {}): Promise<any> {
		const token = this.requireToken();
		const query = new URLSearchParams({
			wstoken: token,
			wsfunction,
			moodlewsrestformat: "json",
			...params,
		});
		const url = `${this.baseUrl}/webservice/rest/server.php?${query.toString()}`;
		const res = await requestUrl({ url, method: "GET" });
		const body = res.json;
		if (body && body.exception) {
			throw new Error(`Moodle API error (${wsfunction}): ${body.message || body.exception}`);
		}
		return body;
	}

	/** Get the current user's id — needed for core_enrol_get_users_courses. */
	async getUserId(): Promise<number> {
		const info = await this.callFunction("core_webservice_get_site_info");
		return info.userid;
	}

	/** List all courses the authenticated user is enrolled in. */
	async getCourses(): Promise<MoodleCourse[]> {
		const userId = await this.getUserId();
		const courses = await this.callFunction("core_enrol_get_users_courses", {
			userid: String(userId),
		});
		return courses.map((c: any) => ({
			id: c.id,
			shortname: c.shortname,
			fullname: c.fullname,
		}));
	}

	/**
	 * List the file contents of a course, grouped by section (Moodle's
	 * "topic" headers — in this setup, each section is one HND module,
	 * e.g. "Wireless Device Security"). Moodle's raw response nests
	 * modules -> contents (files); this flattens that into per-section
	 * groups for simpler syncing. Also records which section each
	 * course-module (activity) belongs to, so assignment attachments
	 * fetched separately can be attributed back to the right section.
	 */
	async getCourseFiles(courseId: number): Promise<MoodleModuleContent[]> {
		const sections = await this.callFunction("core_course_get_contents", {
			courseid: String(courseId),
		});

		this.lastCourseModuleToSection.clear();

		const result: MoodleModuleContent[] = [];
		for (const section of sections) {
			const files: MoodleFile[] = [];
			for (const mod of section.modules || []) {
				this.lastCourseModuleToSection.set(mod.id, { id: section.id, name: section.name || "General" });
				for (const content of mod.contents || []) {
					if (content.type === "file" && content.fileurl) {
						files.push({
							filename: content.filename,
							fileurl: content.fileurl,
							filesize: content.filesize || 0,
							timemodified: content.timemodified || 0,
							filepath: content.filepath,
						});
					}
				}
			}
			if (files.length > 0) {
				result.push({ id: section.id, name: section.name || "General", files });
			}
		}
		return result;
	}

	/**
	 * List every assignment activity's own attached files (the tutorial
	 * document a lecturer uploads onto the assignment itself, e.g.
	 * "Tutorial 01 - OS Research"), keyed by which section they belong to.
	 * This is a *different* Moodle content type from getCourseFiles():
	 * assignments are activities with submission points, not file
	 * resources, so core_course_get_contents does not return their
	 * intro attachments — mod_assign_get_assignments does.
	 * Must be called after getCourseFiles() for the same course, since it
	 * relies on the section lookup that call builds.
	 */
	async getAssignmentFiles(courseId: number): Promise<MoodleModuleContent[]> {
		const response = await this.callFunction("mod_assign_get_assignments", {
			"courseids[0]": String(courseId),
		});

		const bySection = new Map<number, MoodleModuleContent>();
		const course = (response.courses || []).find((c: any) => c.id === courseId);
		if (!course) return [];

		for (const assignment of course.assignments || []) {
			const sectionInfo = this.lastCourseModuleToSection.get(assignment.cmid);
			if (!sectionInfo) continue; // assignment not in any section we saw — skip rather than guess

			const files: MoodleFile[] = (assignment.introattachments || []).map((att: any) => ({
				filename: att.filename,
				fileurl: att.fileurl,
				filesize: att.filesize || 0,
				timemodified: att.timemodified || 0,
			}));
			if (files.length === 0) continue;

			const existing = bySection.get(sectionInfo.id);
			if (existing) {
				existing.files.push(...files);
			} else {
				bySection.set(sectionInfo.id, { id: sectionInfo.id, name: sectionInfo.name, files });
			}
		}

		return Array.from(bySection.values());
	}

	/** Download a single file's raw bytes. Moodle file URLs need the token appended. */
	async downloadFile(fileurl: string): Promise<ArrayBuffer> {
		const token = this.requireToken();
		const separator = fileurl.includes("?") ? "&" : "?";
		const url = `${fileurl}${separator}token=${token}`;
		const res = await requestUrl({ url, method: "GET" });
		return res.arrayBuffer;
	}
}
