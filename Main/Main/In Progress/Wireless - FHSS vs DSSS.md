There are two popular methods for using the spread spectrum in wireless transmissions, they are Frequency-Hopping Spread Spectrum (**FHSS**) and Direct-Sequence Spread Spectrum (**DSSS**). 

Your task is to:

Find the inventor and write a short biography on their achievements in this field.

Full explanation on the design and uses of Frequency-hopping Spread Spectrum (**FHSS**).

Full explanation on the design and uses of Direct-sequence Spread Spectrum (**DSSS**).

Advantages and disadvantages of using both designs and how they compare to each other.

Your report should be fully formatted with cover page, contents, references and contain at least 500 words.

The inventors of Frequency-Hopping Spread Spectrum (FHSS) are Hedy Lamarr and George Antheil, who developed the concept during World War II to enhance secure communication.

Direct Sequence Spread Spectrum (DSSS) is a technique used in wireless communication to spread the transmitted signal over a wide frequency band. It uses a unique spreading code called as pseudo-noise (PN) code to expand the signal’s bandwidth. This spreading ensures that the signal appears as noise across a broad spectrum, making it harder for eavesdroppers to intercept or jam. DSSS is a form of spread spectrum communication that plays an important role in enhancing the security and reliability of wireless transmissions. It’s widely used in technologies like Wi-Fi (802.11b), 3G, 4G, and GPS systems where high-speed data transfer, noise resistance, and secure communication are essential.

Key Components of DSSS

Pseudo-noise (PN) Code: A unique spreading code used to expand the signal’s bandwidth, making it appear as noise.

Chipping Sequence: A high-rate sequence that modulates the signal, creating the spread spectrum effect.

DSSS Modulation Techniques: Modulation methods like BPSK (Binary Phase Shift Keying) and QPSK (Quadrature Phase Shift Keying) are used to encode the signal.

Chip Rate vs Data Rate: The chip rate refers to the speed at which the chipping sequence is applied, while the data rate is the speed at which actual data is transmitted.

Correlation and Despreading: At the receiver end, correlation with the PN code allows the receiver to despread the signal and recover the transmitted data.

Synchronization: It ensures that the transmitter and receiver are in sync, allowing for accurate data decoding.

Signal-to-noise Ratio (SNR): DSSS improves the signal-to-noise ratio, making the signal more resilient to noise and interference.

CDMA (Code Division Multiple Access): DSSS is commonly used in CDMA systems, where multiple users share the same frequency by using different PN codes.

Matched Filter: A filter at the receiver that is tuned to the PN code, maximizing signal detection and minimizing errors.

DSSS Transmitter and Receiver: The transmitter spreads the data using the PN code, while the receiver despreads and decodes the signal.

**Working of DSSS**

1.       **Encoding the Data Signal:** The original data is first encoded using a pseudo-noise (PN) sequence to spread the signal across a wider bandwidth.

2.       **Modulation:** The encoded data is then modulated using techniques like BPSK or QPSK to carry the information over the carrier wave.

3.       **Signal Spreading:** The modulated signal is multiplied by a chipping sequence (PN code), expanding the signal's bandwidth and making it less vulnerable to interference.

4.       **Transmission of the Spread Signal:** The spread signal is transmitted as a [radio frequency](https://www.geeksforgeeks.org/computer-networks/introduction-of-radio-frequency-identification-rfid/) (RF) signal, with the increased bandwidth providing resistance to noise.

5.       **Reception of the Signal:** The receiver picks up the transmitted signal, which has been spread across a wide frequency band.

6.       **Synchronization:** Synchronization between the transmitter and receiver ensures that both are using the same PN sequence for decoding the signal.

7.       **Correlation and Despreading:** At the receiver, the signal is correlated with the same PN sequence used in encoding, allowing the receiver to despread the signal and recover the original data.

8.       **Demodulation:** After despreading, the signal is demodulated to retrieve the data, reversing the modulation process.

9.       **Interference Rejection:** The spread signal's wider bandwidth allows it to reject interference and jamming, improving signal quality in noisy environments.

10.    **Decoding:** Finally, the data is decoded to its original form, ready for further processing or use.

Advantages of DSSS

Interference Resistance: By distributing the signal over a broad frequency range, DSSS reduces the effect of interference, and the system becomes more robust against external interference.

Jamming Immunity: The broad bandwidth of DSSS provides greater immunity to jamming since it is more difficult for attackers to jam the signal across the entire spectrum.

Secure Communication: The signal is encoded with a special PN code, making it hard for unauthorized interception or decoding, thereby increasing security.

Multipath Mitigation: The receiver can extract the signal even if it is reflected or scattered, mitigating multipath interference.

CDMA Compatibility: The system is compatible with CDMA, enabling multiple users to use the same frequency band with different spreading codes.

Signal Integrity: The SNR remains high to preserve signal integrity despite noise environments.

Simultaneous Users: There are no interfering users despite having simultaneous access to the same frequency band, increasing network capacity.

Robust Performance: Reliable communication across different environments is assured with stability offered in urban as well as rural settings.

Applications of DSSS

Wi-Fi (802.11b): Used in the Wi-Fi 802.11b standard to offer interference immunity, providing stable communication within short distances.

CDMA Networks: An integral part of CDMA networks, allowing many users to communicate on the same frequency band with varying spreading codes.

3G, 4G, and 5G Networks: A central component of cellular technologies such as 3G, 4G, and 5G, providing secure and effective data transmission over broad frequency bands.

GPS: Aids in propagating satellite signals, offering enhanced resistance to noise and signal accuracy.

Military Communications: Employed for secure, jam-resistant transmission, guaranteeing reliability and safety in critical operations.

Satellite Communications: Offers enhanced resistance to interference and signal quality in satellite systems for long-distance communication.

IoT Devices: Minimizes interference and guarantees reliable, low-power communication among a broad variety of connected devices.

RFID Systems: Enhances performance by minimizing interference and improving accuracy over longer transmission ranges.

Bluetooth Coexistence: Assists in minimizing interference between Bluetooth devices and other wireless systems to provide smoother operation in dense frequency bands.

Cellular Backhaul: Provides high-quality signal transmission between network towers to enhance overall network performance.

challenges and Limitations

Bandwidth Requirements: DSSS needs considerable bandwidth to spread the signal, which can constrain efficiency in systems with constrained spectrum.

Near-Far Problem: Transmitters close by dominate weaker ones, producing interference and diminishing DSSS efficiency in certain environments.

Synchronization Complexity: Synchronization between the transmitter and receiver is important for successful signal recovery. Timing errors can result in data loss.

Code Interference: Inefficient handling of PN codes in multi-user systems can result in interference, impacting communication quality.

Power Consumption: Increased power consumption due to spreading and processing the signal is a constraint in battery-powered devices such as IoT sensors.

Multipath Fading: Although DSSS avoids multipath interference, severe cases of multipath fading can still impair signal quality.

Receiver Sensitivity: DSSS demands highly sensitive receivers to demodulate the spread signal. Inadequate sensitivity may result in signal loss in some environments.

in the spread spectrum, the information is transmitted in short breaks of data at different carrier frequencies. In the frequency-hopping spread spectrum (FHSS), each component is transmitted at a different carrier frequency. Conversely, multi-carrier systems (such as OFDM) transmit multiple signals on a single carrier frequency. The spread spectrum can be used to send independent digital data streams across a noisy channel by assigning different 'slots' to each signal.

In FHSS systems, the transmitted power is concentrated on one or a few carriers at a time. The carrier frequencies are chosen in accordance with a pseudo-random sequence or hopping sequence that changes periodically, so as to prevent long-term predictability of the carrier frequencies used. The receiver correlates received signals against the sequence of the received signals to determine which doesn't interfere from noise and interference.

The exact form and implementation of the frequency-hopping sequence are different for each radio system. The most widely used sequence is the binary offset code, which is used in [Bluetooth](https://www.geeksforgeeks.org/computer-networks/bluetooth/) and IEEE 802.15.4. Several sequence types have been proposed, all of which implement the same concept: a pseudo-random sequence that changes over time, making it difficult to predict the next frequency. Some systems use multiple parallel sequences so that even if one sequence is compromised, others can be used to communicate.

The output of the pseudo-random number generator (PRNG) is fed into a counter that sequentially counts up to the total number of frequencies in one hop set (N). The PRNG and counter are synchronized with an exactly matching clock at both sender and receiver sides.

### Advantages of FHSS:

Some of the major advantages are as follows:

·         The processing gain PG is higher than that of DSSS system.

·         The synchronization is not greatly dependent on the distance.

·         The serial search system with FHSS needs shorter time for acquisition.

### Issues Related to Frequency-Hopping Spread Spectrum in Wireless Networks:

·         Frequency-hopping spread spectrum uses complex mathematical formulas that change over time and simultaneously change at both sender and receiver sides. The complexity of calculating the formula using a processor or microprocessor is hard to understand.

·         The accuracy of the frequency hopping spread spectrum is too high (complexity) for some real-world scenarios such as military communication because the number of different sequences available is limited by the memory and computational power at both sender and receiver sides, which restricts its flexibility in assigning certain slots to certain users.

·         Frequency-hopping spread spectrum is too complex for some real-world scenarios, because it may cause interference between some channels, causing a clash and lack of mutual understanding among users.

·         The performance of the frequency hopping spread spectrum can be influenced by temperature (temperature affects the speed of frequency changing); it may also be affected by interference between channels.