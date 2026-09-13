## स्याउ OS (SyauOS)

As i am a nepali person obssied with the mac os so i just thouht creating 
os with some unique name after some time i got this name 
स्याउ its mean apple in english so i wrote it # स्याउ OS (SyauOS)

#how i build it 

I started with some guide from stardence itself 
some from docs and some from youtube toturial i wont say 
i dindt use ai i used for help and understand how the things actually works 
then started what to and implemented one by one feature that were on my mind


## Built-in Applications

| App | Description | Key Tech |
|---|---|---|
| **Devlogs** | Interactive developer notes documenting real bugs, fixes, and architecture choices | Local state, theme toggling |
| **Notes** | Persistent markdown/text scratchpad with word count and autosave | LocalStorage |
| **Calculator** | Clean desktop calculator with keyboard input support | JavaScript math evaluation |
| **Browser** | In-OS web portal with curated developer bookmarks and external launch | HTML iframe + sandbox |
| **Capture** | Screen recording tool with microphone audio and photo booth mode | `navigator.mediaDevices` |
| **Terminal** | Custom `syau-sh` terminal with commands (`help`, `neofetch`, `date`, `clear`, `apps`) | Command parser |
| **Music Player** | Spotify Web Player hub with curated coding playlists | Embedded iframe |
| **Settings** | System customization (dark/light mode, accent color, widget toggles) | Zustand store |
| **Studio** | Live HTML/CSS/JavaScript interactive scratchpad runner | Sandboxed iframe |
| **Store** | Curated catalog of installable web utilities and mini-apps | App registry |
| **Gallery** | Image viewer showcasing desktop wallpapers and photos | Modal lightbox |
| **About Me** | Builder portfolio detailing certifications and Hack Club projects | Vector layout |




##Tech stack 


frontend :- react , ts ,  Lucide React (vector SVG, zero emojis across the entire codebase), Tailwind CSS + CSS Custom Properties (Tokens)

Backend :- express and node 




## How to run the project Running Locally

```bash
git clone https://github.com/susantedit/shayu-OS.git
cd shayu-OS
npm install
npm run dev

```

---