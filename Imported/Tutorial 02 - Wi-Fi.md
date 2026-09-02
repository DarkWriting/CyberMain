---
source_file: "Tutorial 02 - Wi-Fi.docx"
source_format: "docx"
imported_at: "2026-09-02T08:35:20.815+01:00"
---

Tutorial


Wi-Fi

1. What is the primary goal of implementing a layered model in wireless device security?

to enhance the security procedures

- Easier to teach communication process.
- Speeds development, changes in one layer does not affect how the other levels works.
- Standardization across manufactures.
- Allows different hardware and software to work together.
- Reduces complexity.

1. How does the Open System Interconnection (OSI) model benefit communication processes?

layered approach allows for the division of complex network functions into smaller, manageable parts, making it easier for developers and engineers to create interoperable and flexible systems.

1. What are the two sub-layers of the OSI link layer?

Data Link & Physical

1. What is the main function of the MAC sub-layer in the OSI model?

The purpose of the MAC protocols is to avoid collisions and in consequence data loss. This could happen, if several stations within the same network try to send and receive data at the same time.

1. List five types of wireless devices that can be vulnerable to attacks.

WLAN, Mobile Phones, Bluetooth, infrared, near field communication

1. What was the first wireless encryption standard introduced, and what was its main vulnerability?
WEP (Wired Equivalent Privacy)
2. How did Wi-Fi Protected Access (WPA) improve upon WEP?

the key difference was the use of Temporal Key Integrity Protocol, creating a more rigorous security that could perform packet key mixing.

1. What is the key encryption improvement introduced with WPA2?

it introduces Cipher-block Chaining Message (CCMP), a new AES-based encryption mode with strong security.

Advance Encryption Standard(AES) uses a 128bit key to encrypt data in 128 blocks. The 128 data blocks can use cypher keys of 128, 192 and 256 bits.

1. Why is physical security still important in wireless networks?

Physical security is still important in wireless networks because it protects the physical environment in which the network operates, which is crucial for safeguarding its integrity and ensuring the protection of sensitive information

1. What does IEEE 802.3 emphasise in terms of physical security?

- Port control and access prevention
- Secured ports to assigned MAC addresses
- Physical security of all network hardware, routers, switches, servers etc….
- Perform an auditing map( understand what hardware is running at what time. Should it be running at that time?
- Controlled patch and software updates
- Personnel access control

1. What is piggybacking in the context of wireless security?

If you fail to secure your wireless network, anyone with a wireless-enabled computer in range of your access point can use your connection

Wardriving

Evil Twin Attacks

Wireless Sniffing. ...

Unauthorized Computer Access. ...

Shoulder Surfing. ...

Theft of Mobile Devices.

1. Define "wardriving" and its potential risks.

Wardriving is the act of searching for and mapping unsecured Wi-Fi networks while driving in a vehicle

Data Theft, Privacy Violations, Network Compromise and reputation damage

1. What is an Evil Twin Attack, and why is it difficult to prevent?

An Evil Twin Attack occurs when an attacker sets up a fake Wi-Fi access point that mimics a legitimate network. It looks like a legitimate access point to users and if settings like Auto-Connect is enabled on devices it may automatically connect to the Fake Wi-Fi access point.

1. What is the difference between Intrusion Detection Systems (IDS) and Intrusion Prevention Systems (IPS)?
2. How does an IDS differ from a firewall?

n IDS is a monitoring tool that analyzes network or system traffic for signs of malicious activity or policy violations, It operates passively. IDS can use signature-based detection to identify known threats or anomaly-based detection to spot unusual behavior patterns

1. In what way does an IPS enhance network security compared to an IDS?

An Intrusion Prevention System (IPS) enhances network security by actively blocking or mitigating threats in real-time, while an Intrusion Detection System (IDS) focuses on passive monitoring and alerting without blocking traffic.

1. What is Vistumbler, and how does it assist in wireless network security?

Vistumbler is an open source Windows application that finds Wireless access points - Uses the Vista command 'netsh wlan show networks mode=bssid' to get wireless information.  It displays the basic AP details, including the exact authentication and encryption methods, and can even speak the SSID and RSSI.

The main purpose of Vistumbler is to map and visualize the access points around you based on the wireless and GPS data collected.

1. What unique feature does Vistumbler offer in terms of tracking wireless networks?

Real-time GPS Tracking: It supports GPS receivers, allowing users to track access points in real-time.

Live Google Earth Mapping: Users can automatically export access points to Google Earth, providing a visual representation of the wireless landscape.

Signal Strength Logging: Vistumbler captures raw RSSI, noise floor, and channel width data, which is useful for analyzing network performance.

1. What is Kismet, and how does it function in wireless security?

Kismet is a network detector, packet sniffer, and intrusion detection system for 802.11 wireless LANs. Kismet will work with any wireless card which supports raw monitoring mode, and can sniff 802.11a, 802.11b, 802.11g, and 802.11n traffic.

1. What additional actions can an IPS perform that an IDS cannot?

Real-time Detection and Blocking: IPS monitors network traffic in real-time and can automatically block or drop malicious packets before they reach the target system.

Traffic Preprocessing: IPS preprocesses incoming traffic to ensure it is correctly interpreted and can inspect packets at multiple layers of the OSI model.

Automated Response: IPS can take automated actions such as dropping malicious packets, terminating malicious sessions, or blocking traffic from suspicious sources.

Layered Packet Inspection: IPS performs deep packet inspection to understand both the structure and intent behind the network traffic, allowing it to detect and prevent attacks.

1. Explain encryption standards of the 4 below:

  1. Wired Equivalent Privacy (WEP)

It uses static encryption keys of 64-bit or 128-bit lengths, combining a shared key with a 24-bit initialization vector (IV) for encrypting data.

- 

  1. Wi-Fi Protected Access (WPA)

Temporal Key Integrity Protocol (TKIP) for encryption, generating a unique 128-bit key for each data packet.

- 

  1. Wi-Fi Protected Access 2 (WPA 2)

It uses the Advanced Encryption Standard (AES) algorithm for encryption. employs two types of encryption keys: a pre-shared key (PSK) for personal use and an enterprise key (RADIUS) for larger organizations. It also supports the Temporal Key Integrity Protocol (TKIP) for temporary encryption keys.

- 

  1. Wi-Fi Protected Access 3 (WPA 3)

Enhanced Encryption: WPA 3 supports the use of AES in Galois/Counter Mode (GCM), which is more secure than the previous CCMP protocol.

Simultaneous Authentication of Equals (SAE): This replaces the older WPA 2-PSK method, improving security against pre-shared key attacks.

Forward Secrecy: WPA 3 provides forward secrecy, meaning that even if a key is compromised, it cannot be used to decrypt past or future communications.

Opportunistic Wireless Encryption (OWE): This feature automatically encrypts data transmitted over public networks, protecting against eavesdropping.

1. What are the Main Threats to Wi-Fi Security?

  - Man-in-the-middle attack
  - Wi-Fi Jamming
  - Evil twin attacks
  - Unencrypted / wrongly configured networks
  - Malware distribution