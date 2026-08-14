// Load button sizing config and apply to .btn elements responsively
(function(){
  async function loadConfig(){
    try{
      const res = await fetch('buttons.json');
      if(!res.ok) throw new Error('Failed to load buttons.json');
      const cfg = await res.json();
      applyButtonStyles(cfg);
      window.addEventListener('resize', debounce(()=>applyButtonStyles(cfg),120));
    }catch(e){
      console.warn('Button config load failed, using defaults',e);
    }
  }

  function debounce(fn,ms){let t;return ()=>{clearTimeout(t);t=setTimeout(fn,ms)}}

  function applyButtonStyles(cfg){
    const w = window.innerWidth;
    const bp = cfg.breakpoints || {};
    let styleKey = 'default';
    // simple matching: check mobile then tablet then desktop
    if(bp.mobile && w <= bp.mobile.maxWidth) styleKey = bp.mobile.buttonStyle;
    else if(bp.tablet && w <= bp.tablet.maxWidth) styleKey = bp.tablet.buttonStyle;
    else if(bp.desktop && w >= (bp.desktop.minWidth||0)) styleKey = bp.desktop.buttonStyle;

    const style = (cfg.buttons && cfg.buttons[styleKey]) || cfg.buttons.default || {};
    const btns = document.querySelectorAll('.btn');
    btns.forEach(b=>{
      if(style.padding) b.style.padding = style.padding;
      if(style.fontSize) b.style.fontSize = style.fontSize;
      if(style.borderRadius) b.style.borderRadius = style.borderRadius;
      if(style.maxWidth) b.style.maxWidth = style.maxWidth;
    });
  }

  // init
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',loadConfigAndEmoji);
  else loadConfigAndEmoji();

  // --- emoji generation for profile names ---
  function hashString(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h+= (h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return h>>>0}
  const EMOJI_LIST = ["😀","😃","😄","😁","😅","😎","🫶","🤝","🏡","🛏️","🧑‍🤝‍🧑","🌆","🌿","🐶","🐱","🚲","☕","🎧","📚","🧳"]

  function emojiForName(name){
    if(!name) return '🙂';
    const idx = hashString(name) % EMOJI_LIST.length;
    return EMOJI_LIST[idx];
  }

  function applyEmojis(){
    const profiles = document.querySelectorAll('.profile');
    profiles.forEach(p=>{
      const nameEl = p.querySelector('.profile-name');
      const emojiEl = p.querySelector('.emoji');
      if(nameEl && emojiEl){
        const name = nameEl.textContent.trim();
        emojiEl.textContent = emojiForName(name);
        // also set accessible label
        nameEl.setAttribute('aria-label', `${name} — ${emojiEl.textContent}`);
      }
    });
  }

  function loadConfigAndEmoji(){
    loadConfig();
    applyEmojis();
    loadImagesConfig();
  }

  async function loadImagesConfig(){
    try{
      const res = await fetch('images.json');
      if(!res.ok) throw new Error('Failed to load images.json');
      const cfg = await res.json();
      applyImageOptions(cfg);
    }catch(e){
      console.warn('Images config load failed',e);
    }
  }

  function applyImageOptions(cfg){
    if(!cfg || !cfg.listings) return;
    Object.entries(cfg.listings).forEach(([id,opts])=>{
      const article = document.querySelector(`[data-image-id="${id}"]`);
      if(!article) return;
      let img = article.querySelector('.card-media img');
      if(!img){
        img = document.createElement('img');
        article.querySelector('.card-media').appendChild(img);
      }
      if(opts.src) img.src = opts.src;
      if(opts.alt) img.alt = opts.alt;
      if(opts.srcset) img.srcset = opts.srcset;
      if(opts.loading) img.loading = opts.loading;
      const style = img.style || img;
      style.objectFit = opts.objectFit || 'cover';
      if(opts.filter) style.filter = opts.filter;
    });
  }
})();
