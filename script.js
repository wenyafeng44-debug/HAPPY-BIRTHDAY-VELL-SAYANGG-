// Shared script for index.html and birthday.html
// Handles: password login + floating hearts (index), confetti + audio jingle + controls (birthday)
// Created: 2026-06-29

(function(){
  'use strict';

  /* ====== Config ====== */
  const PLAIN_PASSWORD = '14626'; // NOTE: client-side password is visible in repo

  /* ====== Helpers ====== */
  function qs(sel, ctx=document){ return ctx.querySelector(sel); }
  function qsa(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }
  function rand(min, max){ return Math.random()*(max-min)+min; }

  /* ====== INDEX PAGE: password + floating hearts ====== */
  function initIndex(){
    const form = qs('#loginForm');
    const input = qs('#password');
    const error = qs('#error');
    const heartsContainer = qs('.hearts');

    if(form && input){
      form.addEventListener('submit', function(ev){
        ev.preventDefault();
        const val = (input.value || '').trim();
        if(val === PLAIN_PASSWORD){
          window.location.href = 'birthday.html';
        } else {
          if(error) error.textContent = 'Password Salah ❤️';
          input.focus();
        }
      });
    }

    // allow Enter/Return on password input
    if(input){
      input.addEventListener('keypress', function(e){
        if(e.key === 'Enter') form && form.requestSubmit && form.requestSubmit();
      });
    }

    // Floating hearts (visual only) — graceful if container missing
    if(!heartsContainer) return;

    const HEART_COUNT = 22;
    for(let i=0;i<HEART_COUNT;i++){
      const h = document.createElement('div');
      h.className = 'heart';
      h.textContent = '❤';
      h.style.left = (Math.random()*100) + 'vw';
      const dur = 5 + Math.random()*8;
      const delay = -(Math.random()*dur);
      h.style.animationDuration = dur + 's';
      h.style.animationDelay = delay + 's';
      h.style.fontSize = (12 + Math.random()*36) + 'px';
      h.style.opacity = (0.4 + Math.random()*0.8).toString();
      heartsContainer.appendChild(h);
    }
  }

  /* ====== BIRTHDAY PAGE: confetti + audio ====== */
  function initBirthday(){
    const canvas = qs('#confettiCanvas');
    const celebrateBtn = qs('#celebrateBtn');
    const playPauseBtn = qs('#playPauseBtn');

    if(!canvas) return;

    const ctx = canvas.getContext('2d');
    let W = canvas.width = innerWidth;
    let H = canvas.height = innerHeight;
    window.addEventListener('resize', ()=>{ W = canvas.width = innerWidth; H = canvas.height = innerHeight; });

    let particles = [];
    let animationStarted = false;

    class Particle{
      constructor(){ this.reset(); }
      reset(){
        this.x = rand(0,W);
        this.y = rand(-H,0);
        this.w = rand(6,14);
        this.h = rand(6,12);
        this.color = `hsl(${Math.floor(rand(0,360))},80%,60%)`;
        this.vx = rand(-0.5,0.5);
        this.vy = rand(1,4);
        this.rot = rand(0,Math.PI*2);
        this.vr = rand(-0.1,0.1);
        this.alpha = 1;
      }
      update(){
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02; // gravity
        this.rot += this.vr;
        if(this.y > H + 20 || this.x < -50 || this.x > W + 50) this.reset();
      }
      draw(){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
        ctx.restore();
      }
    }

    function makeConfetti(count=150){
      particles = [];
      for(let i=0;i<count;i++) particles.push(new Particle());
    }

    function animate(){
      ctx.clearRect(0,0,W,H);
      for(let p of particles){ p.update(); p.draw(); }
      requestAnimationFrame(animate);
    }

    // WebAudio jingle (synth) — short melody
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function playJingle(){
      if(!AudioCtx) return;
      if(!audioCtx) audioCtx = new AudioCtx();
      const now = audioCtx.currentTime;
      const notes = [440, 523.25, 659.25, 523.25, 440];
      const dur = 0.28;
      notes.forEach((freq,i)=>{
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.value = 0.0001;
        o.connect(g); g.connect(audioCtx.destination);
        o.start(now + i*dur*0.9);
        g.gain.linearRampToValueAtTime(0.12, now + i*dur*0.9 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + (i+1)*dur*0.9);
        o.stop(now + (i+1)*dur*0.9);
      });
    }

    let enabledSound = false;
    if(playPauseBtn){
      playPauseBtn.addEventListener('click', ()=>{
        enabledSound = !enabledSound;
        playPauseBtn.textContent = enabledSound ? '⏸ Musik Aktif' : '▶ Putar Musik';
        if(enabledSound){ try{ playJingle(); }catch(e){} }
      });
    }

    if(celebrateBtn){
      celebrateBtn.addEventListener('click', ()=>{
        makeConfetti(220);
        if(!particles.length) makeConfetti(220);
        if(!animationStarted){ animate(); animationStarted = true; }
        if(enabledSound){ try{ playJingle(); }catch(e){} }
        setTimeout(()=>{ makeConfetti(120); }, 4000);
      });
      // keyboard accessibility
      celebrateBtn.addEventListener('keyup', (e)=>{ if(e.key === 'Enter' || e.key === ' ') celebrateBtn.click(); });
    }

    // Auto small burst after load
    window.addEventListener('load', ()=>{
      setTimeout(()=>{
        makeConfetti(120);
        if(!animationStarted){ animate(); animationStarted = true; }
        try{ if(enabledSound){ playJingle(); } }catch(e){}
      }, 900);
    });
  }

  /* ====== Init on DOMContentLoaded ====== */
  document.addEventListener('DOMContentLoaded', ()=>{
    // init both — each function guards for missing elements
    initIndex();
    initBirthday();
  });

})();
