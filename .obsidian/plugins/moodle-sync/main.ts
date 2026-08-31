import { App, Notice, Plugin, PluginSettingTab, Setting, normalizePath, TFile } from "obsidian";
import { MoodleClient, MoodleModuleContent } from "./moodleClient";

interface SectionMapping {
	sectionId: number; // Moodle section id (stable even if the section is renamed)
	sectionName: string; // display name at the time it was mapped, for the settings UI
	moduleFolder: string; // your module code, e.g. "H17M34"
}

interface MoodleSyncSettings {
	moodleUrl: string;
	authMode: "password" | "token";
	username: string;
	password: string;
	token: string;
	courseId: number | null; // the single HND course id, detected once
	courseName: string; // display only
	vaultModulesRoot: string; // e.g. "01-Modules"
	mappings: SectionMapping[];
	// "sectionId:filename:filepath" -> timemodified, so re-syncing doesn't re-download unchanged files
	syncState: Record<string, number>;
}

const DEFAULT_SETTINGS: MoodleSyncSettings = {
	moodleUrl: "",
	authMode: "password",
	username: "",
	password: "",
	token: "",
	courseId: null,
	courseName: "",
	vaultModulesRoot: "01-Modules",
	mappings: [],
	syncState: {},
};

export default class MoodleSyncPlugin extends Plugin {
	settings!: MoodleSyncSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "moodle-sync-run",
			name: "Sync Moodle files into vault",
			callback: () => this.runSync(),
		});

		this.addRibbonIcon("refresh-cw", "Sync Moodle files", () => {
			this.runSync();
		});

		this.addSettingTab(new MoodleSyncSettingTab(this.app, this));
	}

	async loadSettings() {
		const loaded = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);

		// Migration: mappings from before the course->section rework used
		// { moodleShortname, moduleFolder } instead of { sectionId, sectionName, moduleFolder }.
		// Old-shape entries would silently never match a section id and just
		// stop syncing — better to drop them and tell the user to re-add.
		const hasStaleShape = this.settings.mappings.some(
			(m: any) => m.sectionId === undefined && m.moodleShortname !== undefined
		);
		if (hasStaleShape) {
			this.settings.mappings = [];
			this.settings.courseId = null;
			await this.saveSettings();
			new Notice(
				"Moodle Sync: updated to module-level mapping — please re-run 'Fetch sections' and re-add your module mappings in settings.",
				10000
			);
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/** Build a MoodleClient authenticated per the user's chosen auth mode. */
	private async getAuthenticatedClient(): Promise<MoodleClient> {
		const client = new MoodleClient(this.settings.moodleUrl);
		if (this.settings.authMode === "token") {
			if (!this.settings.token) {
				throw new Error("No token saved — generate one in settings first.");
			}
			client.setToken(this.settings.token);
		} else {
			await client.login(this.settings.username, this.settings.password);
		}
		return client;
	}

	/**
	 * Detect the (single) HND course on this Moodle account and list its
	 * sections. Used by the settings tab to build the mapping table.
	 * If more than one course is found, the first is used and a Notice
	 * explains how to override — this plugin assumes one enrolled course
	 * with modules as sections, matching West Lothian's HND Moodle layout.
	 */
	async detectCourseAndSections(): Promise<MoodleModuleContent[]> {
		const client = await this.getAuthenticatedClient();
		const courses = await client.getCourses();

		if (courses.length === 0) {
			throw new Error("No enrolled courses found on this account.");
		}

		let course = courses[0];
		if (this.settings.courseId) {
			const remembered = courses.find((c) => c.id === this.settings.courseId);
			if (remembered) course = remembered;
		}
		if (courses.length > 1 && !this.settings.courseId) {
			new Notice(
				`Found ${courses.length} courses — using "${course.fullname}". Change this in settings if that's wrong.`,
				6000
			);
		}

		this.settings.courseId = course.id;
		this.settings.courseName = course.fullname;
		await this.saveSettings();

		const sections = await client.getCourseFiles(course.id);

		try {
			const assignmentSections = await client.getAssignmentFiles(course.id);
			for (const asec of assignmentSections) {
				if (!sections.some((s) => s.id === asec.id)) {
					// Include as a mappable section even with 0 files shown here —
					// what matters is that it exists and can be picked, not the count.
					sections.push({ id: asec.id, name: asec.name, files: asec.files });
				}
			}
		} catch (err) {
			console.error("Moodle Sync: could not check assignment attachments while detecting sections", err);
		}

		return sections;
	}

	async runSync() {
		if (!this.settings.moodleUrl) {
			new Notice("Moodle Sync: set your Moodle site URL in plugin settings first.");
			return;
		}
		if (this.settings.authMode === "token" && !this.settings.token) {
			new Notice("Moodle Sync: generate and save a token in plugin settings first.");
			return;
		}
		if (this.settings.authMode === "password" && (!this.settings.username || !this.settings.password)) {
			new Notice("Moodle Sync: set your Moodle username and password in plugin settings first.");
			return;
		}
		if (!this.settings.courseId) {
			new Notice("Moodle Sync: run 'Fetch sections' in plugin settings first.");
			return;
		}
		if (this.settings.mappings.length === 0) {
			new Notice("Moodle Sync: no module mappings configured yet — open plugin settings.");
			return;
		}

		const notice = new Notice("Moodle Sync: connecting...", 0);
		let client: MoodleClient;
		try {
			client = await this.getAuthenticatedClient();
		} catch (err) {
			notice.hide();
			new Notice(`Moodle Sync failed to connect: ${(err as Error).message}`);
			return;
		}

		let sections: MoodleModuleContent[];
		try {
			sections = await client.getCourseFiles(this.settings.courseId);
		} catch (err) {
			notice.hide();
			new Notice(`Moodle Sync could not read course contents: ${(err as Error).message}`);
			return;
		}

		// Assignment attachments (the tutorial doc a lecturer uploads onto
		// the submission activity itself) live in a separate Moodle API,
		// not core_course_get_contents. Fetch them and merge into the same
		// per-section file lists so the download loop below doesn't need
		// to know the difference.
		try {
			const assignmentSections = await client.getAssignmentFiles(this.settings.courseId);
			for (const asec of assignmentSections) {
				const existing = sections.find((s) => s.id === asec.id);
				if (existing) {
					existing.files.push(...asec.files);
				} else {
					sections.push(asec);
				}
			}
		} catch (err) {
			// Don't abort the whole sync if assignment attachments fail —
			// resource files (the common case) still succeed on their own.
			console.error("Moodle Sync: could not read assignment attachments", err);
			new Notice(
				`Moodle Sync: assignment attachments could not be checked (${(err as Error).message}) — resource files will still sync.`,
				6000
			);
		}

		let downloaded = 0;
		let skipped = 0;
		let failed = 0;

		for (const mapping of this.settings.mappings) {
			const section = sections.find((s) => s.id === mapping.sectionId);
			if (!section) {
				// Section had no files this time, or was removed/renamed on Moodle's side
				continue;
			}
			if (!mapping.moduleFolder) {
				continue; // unmapped row — skip silently, settings UI already flags it
			}

			notice.setMessage(`Moodle Sync: checking ${mapping.moduleFolder}...`);

			const destFolder = normalizePath(
				`${this.settings.vaultModulesRoot}/${mapping.moduleFolder}/inbox`
			);
			await this.ensureFolder(destFolder);

			for (const file of section.files) {
				const stateKey = `${section.id}:${file.filename}:${file.filepath || ""}`;
				const lastSynced = this.settings.syncState[stateKey];

				if (lastSynced && lastSynced >= file.timemodified) {
					skipped++;
					continue;
				}

				try {
					const bytes = await client.downloadFile(file.fileurl);
					const destPath = normalizePath(`${destFolder}/${file.filename}`);
					await this.writeBinaryFile(destPath, bytes);
					this.settings.syncState[stateKey] = file.timemodified;
					downloaded++;
				} catch (err) {
					failed++;
					console.error(`Moodle Sync: failed to download ${file.filename}`, err);
				}
			}
		}

		await this.saveSettings();
		notice.hide();

		const summary = `Moodle Sync complete: ${downloaded} downloaded, ${skipped} unchanged${
			failed ? `, ${failed} failed (see console)` : ""
		}.`;
		new Notice(summary, 6000);
	}

	private async ensureFolder(path: string) {
		const existing = this.app.vault.getAbstractFileByPath(path);
		if (!existing) {
			await this.app.vault.createFolder(path).catch(() => {
				// folder may have been created concurrently; ignore
			});
		}
	}

	private async writeBinaryFile(path: string, data: ArrayBuffer) {
		const existing = this.app.vault.getAbstractFileByPath(path);
		if (existing instanceof TFile) {
			await this.app.vault.modifyBinary(existing, data);
		} else {
			await this.app.vault.createBinary(path, data);
		}
	}
}

class MoodleSyncSettingTab extends PluginSettingTab {
	plugin: MoodleSyncPlugin;
	private detectedSections: MoodleModuleContent[] = [];
	private tempPassword = "";
	private mappingsContainer!: HTMLElement;

	constructor(app: App, plugin: MoodleSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Moodle Sync settings" });
		containerEl.createEl("p", {
			text:
				this.plugin.settings.authMode === "token"
					? "Token mode: your Moodle token (not your password) is stored in this vault's .obsidian/plugins/moodle-sync/data.json in plain text. A leaked token can be revoked from your Moodle account without changing your password. Still worth excluding this path if you sync the vault to git or cloud storage."
					: "Password mode: your Moodle password is stored in this vault's .obsidian/plugins/moodle-sync/data.json in plain text. Consider switching to Token mode below. Make sure this path is excluded if you sync this vault to git or cloud storage.",
			cls: "setting-item-description",
		});

		new Setting(containerEl)
			.setName("Moodle site URL")
			.setDesc("e.g. https://moodle.westlothian.ac.uk")
			.addText((text) =>
				text
					.setPlaceholder("https://your-moodle-site")
					.setValue(this.plugin.settings.moodleUrl)
					.onChange(async (value) => {
						this.plugin.settings.moodleUrl = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Authentication method")
			.setDesc(
				"Token is recommended: it's stored instead of your password and can be revoked from your Moodle account without changing your password."
			)
			.addDropdown((drop) =>
				drop
					.addOption("password", "Username & password")
					.addOption("token", "Token")
					.setValue(this.plugin.settings.authMode)
					.onChange(async (value) => {
						this.plugin.settings.authMode = value as "password" | "token";
						await this.plugin.saveSettings();
						this.display();
					})
			);

		new Setting(containerEl)
			.setName("Username")
			.setDesc(
				this.plugin.settings.authMode === "token"
					? "Only needed to generate a token below — not stored after that."
					: "Stored in plain text alongside your password (see warning above)."
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.username)
					.onChange(async (value) => {
						this.plugin.settings.username = value.trim();
						await this.plugin.saveSettings();
					})
			);

		if (this.plugin.settings.authMode === "password") {
			new Setting(containerEl)
				.setName("Password")
				.addText((text) => {
					text.inputEl.type = "password";
					text
						.setValue(this.plugin.settings.password)
						.onChange(async (value) => {
							this.plugin.settings.password = value;
							await this.plugin.saveSettings();
						});
				});
		} else {
			new Setting(containerEl)
				.setName("Password (used once, not saved)")
				.setDesc("Enter your password here only to generate a token below. It is not written to disk in token mode.")
				.addText((text) => {
					text.inputEl.type = "password";
					text.setValue(this.tempPassword).onChange((value) => {
						this.tempPassword = value;
					});
				});

			new Setting(containerEl)
				.setName("Generate token")
				.setDesc("Logs in once using the password above, retrieves a token, and saves the token in place of your password.")
				.addButton((btn) =>
					btn.setButtonText("Generate").onClick(async () => {
						if (!this.plugin.settings.moodleUrl || !this.plugin.settings.username || !this.tempPassword) {
							new Notice("Fill in Moodle site URL, username, and password above first.");
							return;
						}
						btn.setDisabled(true).setButtonText("Generating...");
						try {
							const token = await MoodleClient.fetchToken(
								this.plugin.settings.moodleUrl,
								this.plugin.settings.username,
								this.tempPassword
							);
							this.plugin.settings.token = token;
							this.plugin.settings.password = ""; // never persist the password in token mode
							this.tempPassword = "";
							await this.plugin.saveSettings();
							new Notice("Token generated and saved.");
							this.display();
						} catch (err) {
							new Notice(`Could not generate token: ${(err as Error).message}`);
						}
						btn.setDisabled(false).setButtonText("Generate");
					})
				);

			if (this.plugin.settings.token) {
				new Setting(containerEl)
					.setName("Current token")
					.setDesc(`${this.plugin.settings.token.slice(0, 8)}... (saved)`)
					.addExtraButton((btn) =>
						btn.setIcon("trash").setTooltip("Clear saved token").onClick(async () => {
							this.plugin.settings.token = "";
							await this.plugin.saveSettings();
							this.display();
						})
					);
			}
		}

		new Setting(containerEl)
			.setName("Modules root folder")
			.setDesc("Vault-relative path where module folders live, e.g. 01-Modules")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.vaultModulesRoot)
					.onChange(async (value) => {
						this.plugin.settings.vaultModulesRoot = value.trim() || "01-Modules";
						await this.plugin.saveSettings();
					})
			);

		if (this.plugin.settings.courseName) {
			containerEl.createEl("p", {
				text: `Detected course: ${this.plugin.settings.courseName}`,
				cls: "setting-item-description",
			});
		}

		new Setting(containerEl)
			.setName("Fetch sections")
			.setDesc(
				"Logs in, finds your HND course, and lists its sections (each section is treated as one module)."
			)
			.addButton((btn) =>
				btn.setButtonText("Fetch sections").onClick(async () => {
					btn.setDisabled(true).setButtonText("Fetching...");
					try {
						this.detectedSections = await this.plugin.detectCourseAndSections();
						new Notice(`Found ${this.detectedSections.length} sections with files.`);
					} catch (err) {
						new Notice(`Could not fetch sections: ${(err as Error).message}`);
					}
					btn.setDisabled(false).setButtonText("Fetch sections");
					this.display();
				})
			);

		containerEl.createEl("h3", { text: "Module mappings" });
		containerEl.createEl("p", {
			text: "Map each Moodle section (module) to the vault folder it should sync into. Files land in a single 'inbox' subfolder per module — sort them yourself from there.",
			cls: "setting-item-description",
		});

		this.mappingsContainer = containerEl.createDiv();
		this.renderMappings();
	}

	private renderMappings() {
		this.mappingsContainer.empty();

		this.plugin.settings.mappings.forEach((mapping, index) => {
			new Setting(this.mappingsContainer)
				.setName(mapping.sectionName)
				.setDesc(`${this.plugin.settings.vaultModulesRoot}/<folder>/inbox`)
				.addText((text) =>
					text
						.setPlaceholder("Module folder e.g. H17M34")
						.setValue(mapping.moduleFolder)
						.onChange(async (value) => {
							this.plugin.settings.mappings[index].moduleFolder = value.trim();
							await this.plugin.saveSettings();
						})
				)
				.addExtraButton((btn) =>
					btn.setIcon("trash").setTooltip("Remove mapping").onClick(async () => {
						this.plugin.settings.mappings.splice(index, 1);
						await this.plugin.saveSettings();
						this.renderMappings();
					})
				);
		});

		if (this.detectedSections.length > 0) {
			const unmapped = this.detectedSections.filter(
				(s) => !this.plugin.settings.mappings.some((m) => m.sectionId === s.id)
			);
			if (unmapped.length > 0) {
				let selectedId = unmapped[0].id;
				new Setting(this.mappingsContainer)
					.setName("Add a section mapping")
					.addDropdown((drop) => {
						unmapped.forEach((s) => drop.addOption(String(s.id), s.name));
						drop.onChange((value) => {
							selectedId = Number(value);
						});
					})
					.addButton((btn) =>
						btn.setButtonText("Add").onClick(async () => {
							const section = unmapped.find((s) => s.id === selectedId);
							if (!section) return;
							this.plugin.settings.mappings.push({
								sectionId: section.id,
								sectionName: section.name,
								moduleFolder: "",
							});
							await this.plugin.saveSettings();
							this.renderMappings();
						})
					);
			} else {
				this.mappingsContainer.createEl("p", {
					text: "All detected sections are mapped.",
					cls: "setting-item-description",
				});
			}
		} else if (this.plugin.settings.mappings.length === 0) {
			this.mappingsContainer.createEl("p", {
				text: "Click 'Fetch sections' above to list your modules.",
				cls: "setting-item-description",
			});
		}
	}
}
