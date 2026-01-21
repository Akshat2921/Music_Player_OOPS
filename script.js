// === AudioPlayer Class (simplified) ===
class Track {
    constructor({id, title, artist='Unknown', src, art='https://picsum.photos/100'}) {
      this.id = id;
      this.title = title;
      this.artist = artist;
      this.src = src;
      this.art = art;
    }
  }
  
  // Simple AudioPlayer for demo
  class AudioPlayer {
    constructor(){
      this.tracks = [];
      this.currentIndex = 0;
      this.audio = document.getElementById('audioEl');
      this.songTitle = document.getElementById('songTitle');
      this.songArtist = document.getElementById('songArtist');
      this.artImg = document.getElementById('artImg');
      this.tracksList = document.getElementById('tracksList');
  
      this._attachUI();
    }
  
    _attachUI(){
      document.getElementById('playBtn').addEventListener('click', ()=> this.togglePlay());
      document.getElementById('nextBtn').addEventListener('click', ()=> this.next());
      document.getElementById('prevBtn').addEventListener('click', ()=> this.prev());
  
      const uploadBtn = document.getElementById('uploadBtn');
      const fileInput = document.getElementById('fileInput');
  
      uploadBtn.addEventListener('click', ()=> fileInput.click());
      fileInput.addEventListener('change', (e)=> {
        if(e.target.files) this.handleFiles(e.target.files);
        fileInput.value = '';
      });
    }
  
    togglePlay(){
      if(this.audio.paused) this.audio.play();
      else this.audio.pause();
    }
  
    loadTrack(idx){
      if(!this.tracks[idx]) return;
      this.currentIndex = idx;
      const t = this.tracks[idx];
      this.audio.src = t.src;
      this.audio.play();
      this.songTitle.textContent = t.title;
      this.songArtist.textContent = t.artist;
      this.artImg.src = t.art || 'https://picsum.photos/600/600?random=1';
      this._renderPlaylist();
    }
  
    next(){
      let idx = (this.currentIndex + 1) % this.tracks.length;
      this.loadTrack(idx);
    }
  
    prev(){
      let idx = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
      this.loadTrack(idx);
    }
  
    handleFiles(fileList){
      Array.from(fileList).forEach(file=>{
        const blobUrl = URL.createObjectURL(file);
        const id = 'local_'+Date.now()+'_'+Math.floor(Math.random()*1000);
        const title = file.name.replace(/\.[^/.]+$/, "");
        // Optional: Read tags using jsmediatags
        jsmediatags.read(file, {
          onSuccess: (tag) => {
            const artist = tag.tags.artist || 'Local';
            const titleTag = tag.tags.title || title;
            let artUrl = 'https://picsum.photos/100';
            if(tag.tags.picture){
              const data = tag.tags.picture.data;
              const format = tag.tags.picture.format;
              const byteArray = new Uint8Array(data);
              const blob = new Blob([byteArray], {type: format});
              artUrl = URL.createObjectURL(blob);
            }
            this._addTrack({id, title: titleTag, artist, src: blobUrl, art: artUrl});
          },
          onError: ()=> {
            this._addTrack({id, title, artist:'Local', src: blobUrl, art:'https://picsum.photos/100'});
          }
        });
      });
    }
  
    _addTrack(track){
      const t = new Track(track);
      this.tracks.push(t);
      if(this.tracks.length === 1) this.loadTrack(0); // auto-load first song
      this._renderPlaylist();
    }
  
    _renderPlaylist(){
      this.tracksList.innerHTML = '';
      this.tracks.forEach((t,i)=>{
        const el = document.createElement('div');
        el.className = 'track' + (i===this.currentIndex? ' active':'');
        el.innerHTML = `
          <img src="${t.art}" alt="art">
          <div class="info">
            <div class="t">${t.title}</div>
            <div class="a">${t.artist}</div>
          </div>
          <div class="actions">
            <button class="small-btn" title="Play">▶</button>
            <button class="small-btn" title="Remove">✖</button>
          </div>
        `;
        el.querySelector('.info').addEventListener('click', ()=> this.loadTrack(i));
        el.querySelector('.small-btn[title="Play"]').addEventListener('click', ()=> this.loadTrack(i));
        el.querySelector('.small-btn[title="Remove"]').addEventListener('click', ()=>{
          this.tracks.splice(i,1);
          if(i===this.currentIndex) this.currentIndex = Math.max(0,this.currentIndex-1);
          this._renderPlaylist();
        });
        this.tracksList.appendChild(el);
      });
    }
  }
  
  // Instantiate
  const player = new AudioPlayer();
  window.__AudioPlayer = player;
  