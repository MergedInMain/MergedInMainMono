---
sidebar_position: 1
---

# Install TrueNAS SCALE

This document provides a guide on installing TrueNAS SCALE.  It covers the prerequisites, download process, installation media creation, and the installation procedure itself.

## Prerequisites

Before you begin, ensure you have the following:

*   **Hardware Compatibility:** Verify your hardware meets the minimum requirements for TrueNAS SCALE. Check the official TrueNAS documentation for the latest recommendations.  Crucially, consider:
    *   **CPU:**  64-bit processor (Intel or AMD) with at least two cores. More cores are recommended for heavier workloads.
    *   **RAM:**  Minimum 8GB, but 16GB or more is strongly recommended, especially for ZFS and features like deduplication.  ECC RAM is highly recommended for data integrity.
    *   **Boot Drive:**  A dedicated drive (SSD recommended) for the operating system.  16GB is the absolute minimum, but 32GB or larger is preferable.  Do *not* use a USB stick for long-term installation; they are not reliable enough.
    *   **Storage Drives:**  At least one drive (separate from the boot drive) for data storage.  For optimal performance and redundancy, multiple drives are recommended (for RAID configurations).
    *   **Network Interface Card (NIC):**  At least one Gigabit Ethernet NIC.  For higher performance, 10 Gigabit Ethernet or faster is recommended.
*   **BIOS/UEFI Settings:**  Ensure your system's BIOS or UEFI is configured correctly:
    *   **Boot Order:** Set your system to boot from the installation media (USB drive or DVD).
    *   **AHCI Mode:**  Enable AHCI (Advanced Host Controller Interface) mode for your SATA controllers. Avoid IDE or RAID modes managed by the motherboard *for the drives intended for TrueNAS*. TrueNAS manages storage through ZFS.
    *   **Virtualization (Optional):** If you plan to use virtualization features, enable Intel VT-x or AMD-V in your BIOS/UEFI settings.
    * **UEFI vs. Legacy BIOS:** TrueNAS SCALE prefers UEFI boot, but legacy BIOS boot is also supported. Choose the appropriate mode based on your system and make sure the installation media is created accordingly.
*   **Internet Connection (Recommended):** An internet connection is recommended during installation for downloading updates and accessing online resources.
* **Monitor and Keyboard:** A monitor and keyboard directly connected to the TrueNAS system are required during installation.

## Download TrueNAS SCALE

1.  **Visit the Official Website:** Go to the official TrueNAS website (www.truenas.com).
2.  **Navigate to Downloads:** Find the "Downloads" section and select TrueNAS SCALE.
3.  **Choose the Image:** Select the appropriate ISO image file for your system. Typically, this will be the stable release.
4.  **Download the ISO:** Click the download link to download the ISO image file to your computer.
5.  **Verify Checksum (Recommended):**  After downloading, verify the integrity of the ISO file using a checksum utility (like `md5sum` or `sha256sum`). Compare the generated checksum with the one provided on the TrueNAS website. This ensures the file wasn't corrupted during download.

## Create Installation Media

You can create bootable installation media using either a USB drive or a DVD.

### USB Drive (Recommended)

1.  **Download a USB Imaging Tool:** Download a USB imaging tool like Rufus (Windows), Etcher (Windows, macOS, Linux), or the `dd` command (Linux).
2.  **Select the ISO Image:** Open the imaging tool and select the downloaded TrueNAS SCALE ISO image file.
3.  **Select the USB Drive:** Choose the correct USB drive from the list of available devices.  **Warning:** This process will erase all data on the selected USB drive.  Double-check that you have selected the correct drive.
4.  **Write the Image:** Start the imaging process. The tool will write the ISO image to the USB drive, making it bootable.
5.  **Safely Eject:** Once the process is complete, safely eject the USB drive from your computer.

### DVD

1.  **Use a Disc Burning Tool:** Use your operating system's built-in disc burning tool or a third-party application (like ImgBurn).
2.  **Select "Burn Image to Disc":** Choose the option to burn an image file to disc.
3.  **Select the ISO Image:** Select the downloaded TrueNAS SCALE ISO image file.
4.  **Burn the Disc:** Insert a blank DVD into your DVD drive and start the burning process.

## Installation Procedure

1.  **Boot from Installation Media:** Insert the USB drive or DVD into the TrueNAS system and power it on.  Ensure your BIOS/UEFI is set to boot from the chosen media.
2.  **Select Install/Upgrade:** At the TrueNAS boot menu, select the "Install/Upgrade" option.
3.  **Choose Boot Drive:** Select the drive you want to use for the TrueNAS SCALE operating system.  This will erase all data on the selected drive.
4.  **Installation Options:**
    *  **Create swap:**  Generally recommended.  Creates a swap partition on the boot drive.
5.  **Root Password:**  Enter and confirm a strong password for the `root` user.  This is the administrator account for TrueNAS.  **Do not lose this password.**
6. **Boot Mode Selection:** Select between BIOS and UEFI boot mode. If your system supports UEFI, select UEFI.
7.  **Installation Progress:** The installer will copy the necessary files and configure the system. This may take several minutes.
8.  **Reboot:** Once the installation is complete, the system will prompt you to remove the installation media and reboot.
9.  **Initial Configuration:** After rebooting, TrueNAS SCALE will display the console setup menu.  This menu shows the IP address assigned to your TrueNAS system. Use a web browser on another computer on your network to access the TrueNAS web interface using this IP address.
10. **Web Interface Login:** Log in to the web interface using the `root` username and the password you set during installation.
11. **Post-Installation Configuration:** Complete the initial configuration wizard in the web interface. This includes setting up network settings, creating storage pools, and configuring other services.

## Post-Installation Steps

*   **Network Configuration:** Configure network settings, including static IP addresses, DNS servers, and gateway.
*   **Storage Pool Creation:** Create ZFS storage pools using the available storage drives. Choose an appropriate RAID level for data redundancy and performance (e.g., RAID-Z1, RAID-Z2, Mirror).
*   **Dataset Creation:** Create datasets within the storage pools to organize your data.
*   **Share Creation:** Configure shares (SMB/CIFS, NFS, AFP) to access your data from other devices on the network.
*   **User and Group Management:** Create user accounts and groups to manage access to your data.
*   **System Updates:** Regularly check for and install system updates to ensure you have the latest features and security patches.
*   **Explore Features:** Explore the various features and services offered by TrueNAS SCALE, such as plugins, jails, and virtual machines.

This guide provides a basic overview of the TrueNAS SCALE installation process. For more detailed information and troubleshooting, refer to the official TrueNAS documentation.