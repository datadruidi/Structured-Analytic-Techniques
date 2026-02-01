# network_mapper

`network_mapper` turns packet captures into a graph you can explore in **Obsidian**. It extracts **IPv4 directed edges** from a PCAP (`count,src_ip,dst_ip`) and then generates **one note per IP** with inbound/outbound peers plus a capture summary—so you can pivot through traffic like an entity network.

---

## What it does

1. **PCAP → `edges.csv`**  
   Converts a PCAP/PCAPNG into a directional edge list where each row is **src → dst** with an aggregated packet count.

2. **`edges.csv` → Obsidian notes**  
   Generates:
   - `IPs/<ip>.md` for every IP, listing top outbound and inbound peers
   - `Captures/<capture>.md` summarizing the capture and top connections

![Graph view](assets/img/screenshot_3.png)

---

## Quick Start

### Install
- **Wireshark** (`tshark.exe`; `capinfos.exe` optional but recommended)
- **Python 3.x**
- **Obsidian** (open the vault where you want the notes)

### Run
1. Run the PowerShell script to create `edges.csv`
2. Run the Python script to generate notes **inside your vault**
3. Open your vault in Obsidian and use **Graph view**

![Quick start](assets/img/screenshot_2.png)

---

## How to use

### 1) Create `edges.csv` from a PCAP (PowerShell)

Run `pcap-to-edges.ps1` and provide:
- Path to your `.pcap` / `.pcapng`
- Output folder

![PowerShell run](assets/img/screenshot_1.png)

Output:
- `edges.csv` with columns: `count,src_ip,dst_ip`

---

### 2) Generate Obsidian IP notes (Python)

Run the generator and provide:
- Path to `edges.csv`
- Capture name (optional)
- Output folder **inside your Obsidian vault** (recommended)



### 3) Explore results in Obsidian

After generation, open your vault and explore:

![Graph view](assets/img/screenshot_4.png)

![Graph view](assets/img/screenshot_3.png)


---

## PCAP Sample

The screenshots and example output were generated and tested using PCAPs from the Western Regional Collegiate Cyber Defense Competition (WRCCDC) archive: https://archive.wrccdc.org/pcaps/2026/invitationals2/
