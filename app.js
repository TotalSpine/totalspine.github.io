const screens=[...document.querySelectorAll('[data-screen]')];
const navButtons=[...document.querySelectorAll('[data-nav]')];
function go(id){screens.forEach(s=>s.classList.toggle('active',s.id===id));navButtons.forEach(b=>b.classList.toggle('active',b.dataset.nav===id));window.scrollTo({top:0,behavior: prefersReducedMotion() ? 'auto' : 'smooth'});resetReveals();}
navButtons.forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.nav)));
function prefersReducedMotion(){return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
function resetReveals(){document.querySelectorAll('.screen.active .reveal').forEach((el)=>{el.style.animation='none';el.offsetHeight;el.style.animation='';});}

// Model bounds: ~1.9m tall, centered at origin (y: -0.95 feet -> +0.95 skull).
// target = 3D look-at point on the anatomy; orbit/fov frame that section up close.
const regionCopy={
 cervical:{color:'#b75cff',title:'Cervical Spine',target:'0m 0.66m 0m',orbit:'0deg 76deg 1.5m',fov:'24deg',body:'Neck pain, whiplash, pinched nerves, cervical disc conditions, arm pain, numbness, and headaches after a work or auto injury.'},
 thoracic:{color:'#3d89ff',title:'Thoracic Spine',target:'0m 0.40m 0m',orbit:'0deg 80deg 1.8m',fov:'26deg',body:'Mid-back pain, rib referral patterns, postural pain, fractures, traumatic back symptoms, and symptoms that may need imaging review.'},
 lumbar:{color:'#22f0ff',title:'Lumbar Spine',target:'0m 0.17m 0m',orbit:'0deg 84deg 1.6m',fov:'26deg',body:'Low-back pain, sciatica, herniated or bulging discs, foraminal stenosis, spinal stenosis, and leg pain or numbness.'},
 sacrum:{color:'#c6d1df',title:'SI Joint',target:'0m 0.04m 0m',orbit:'0deg 88deg 1.5m',fov:'26deg',body:'Sacroiliac joint pain, tailbone pain, pelvic-related low back pain, and lower-spine dysfunction.'},
 shoulder:{color:'#27a8ff',title:'Shoulder',target:'0.16m 0.60m 0m',orbit:'28deg 76deg 1.4m',fov:'24deg',body:'Rotator cuff tears, impingement, labral injuries, instability, arthritis, fractures, and traumatic shoulder conditions that affect lifting, reaching, and return to duty.'},
 hip:{color:'#a552ff',title:'Hip',target:'0.10m 0.02m 0m',orbit:'24deg 84deg 1.4m',fov:'26deg',body:'Hip arthritis, bursitis, labral tears, fractures, traumatic hip pain, gait changes, and replacement evaluation when clinically appropriate.'},
 knee:{color:'#ff9b2f',title:'Knee',target:'0.10m -0.42m 0m',orbit:'14deg 88deg 1.5m',fov:'26deg',body:'Meniscus tears, ACL and ligament injuries, patella injuries, arthritis, traumatic knee pain, and knee replacement evaluation when needed.'},
 foot:{color:'#25d7a1',title:'Ankle & Foot',target:'0.10m -0.84m 0m',orbit:'10deg 96deg 1.2m',fov:'28deg',body:'Ankle sprains, foot or ankle fractures, tendon injuries, arthritis, deformities, gait limitations, and lower-extremity return-to-walking issues.'}
};
const OVERVIEW={target:'auto auto auto',orbit:'0deg 78deg 8m',fov:'26deg'};
let zoomedRegion=null;
function setRegion(region,zoomTo=false){
  const info=regionCopy[region];
  if(!info) return;
  document.querySelectorAll('[data-region]').forEach(el=>el.classList.toggle('active',el.dataset.region===region));
  document.documentElement.style.setProperty('--active-region',info.color);
  document.querySelector('.spine-stage')?.setAttribute('data-active-region', region);
  const viewer=document.getElementById('skeletonViewer');
  if(viewer && zoomTo){
    // Tapping the already-zoomed region returns to the full-skeleton overview.
    const view=(zoomedRegion===region)?OVERVIEW:info;
    zoomedRegion=(view===OVERVIEW)?null:region;
    viewer.setAttribute('camera-target', view.target);
    viewer.setAttribute('camera-orbit', view.orbit);
    viewer.setAttribute('field-of-view', view.fov);
    viewer.removeAttribute('auto-rotate');
    viewer.dismissPoster?.();
  }
}
document.querySelectorAll('[data-region]').forEach(el=>el.addEventListener('click',()=>{userSelectedRegion=true;setRegion(el.dataset.region,true);}));

let userSelectedRegion=false;
const skeletonViewer=document.getElementById('skeletonViewer');
if(skeletonViewer){
  skeletonViewer.addEventListener('load',()=>{
    skeletonViewer.classList.add('model-ready');
    skeletonViewer.removeAttribute('auto-rotate-delay');
  });
  skeletonViewer.addEventListener('error',()=>{
    skeletonViewer.classList.add('model-error');
    const fallback=document.createElement('div');
    fallback.className='model-load-error';
    fallback.innerHTML='<strong>3D model could not load.</strong><br>Use Safari or Chrome on iPad with internet access for the 3D viewer script, or run the app from a hosted server/WKWebView bundle.';
    skeletonViewer.parentElement?.appendChild(fallback);
  });
  skeletonViewer.addEventListener('touchstart',()=>skeletonViewer.removeAttribute('auto-rotate'),{passive:true});
  skeletonViewer.addEventListener('mousedown',()=>skeletonViewer.removeAttribute('auto-rotate'));
}


const journey=[
 {t:'Injury',i:'⚡',d:'The patient presents with work-related neck, back, arm, leg, knee, hip, or joint pain.',p:['Document date of injury and body part','Capture current restrictions and work-status need','Identify red flags such as weakness, numbness, or radiating pain','Gather prior treatment and imaging history']},
 {t:'Referral',i:'▤',d:'The referral is organized so the care team can move quickly and appropriately.',p:['Confirm claim number, employer, adjuster, and authorization','Send MRI / CT / X-ray reports and prior records','Include therapy, injection, surgery, or medication history','Clarify whether the request is consult, second opinion, pain management, or surgical review']},
 {t:'Evaluation',i:'♩',d:'A specialist reviews symptoms, function, history, imaging, and treatment goals.',p:['History and physical exam','Functional-limitations review','Workers’ compensation context and activity goals','Discussion of appropriate next steps']},
 {t:'Imaging',i:'◉',d:'Existing imaging is reviewed, and additional imaging may be ordered when clinically appropriate.',p:['MRI, CT, X-ray, and prior studies reviewed','Findings compared with symptoms','Case manager gets a clearer explanation of the problem','Diagnosis supports the treatment pathway']},
 {t:'Treatment',i:'◍',d:'The plan may include conservative care, injections, pain management, therapy, or minimally invasive procedures.',p:['Non-surgical care when appropriate','Image-guided injections and pain management options','Minimally invasive spine or orthopedic procedures when indicated','Plan built around pain relief, mobility, and function']},
 {t:'Recovery',i:'⇧',d:'Progress is monitored as the patient works toward safer activity and better function.',p:['Follow-up visits and progress tracking','Therapy or rehabilitation coordination','Restrictions updated as clinically appropriate','Next milestones communicated clearly']},
 {t:'Return to Activity',i:'✓',d:'The goal is to help the patient safely return to daily life and work-related function.',p:['Functional improvement and activity goals','Work-status planning','MMI or long-term planning when appropriate','Case closed with a clearer care narrative']}
];
const journeyModule=document.getElementById('journeyModule');const journeyDetail=document.getElementById('journeyDetail');
function drawJourney(active=0){
 if(!journeyModule||!journeyDetail) return;
 journeyModule.innerHTML=`<div class="journey-icons">${journey.map((j,i)=>`<button data-step="${i}" class="${i===active?'active':''}"><span>${j.i}</span><b>${j.t}</b><small>${j.d}</small></button>`).join('')}</div>`;
 journeyDetail.innerHTML=`<div><p class="eyebrow">Step ${active+1}</p><h3>${journey[active].t}</h3><p>${journey[active].d}</p></div><ul>${journey[active].p.map(x=>`<li>${x}</li>`).join('')}</ul>`;
 journeyModule.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>drawJourney(+b.dataset.step)));
}
drawJourney();
document.querySelectorAll('.compact-icons [data-step]').forEach(b=>b.addEventListener('click',e=>{document.querySelectorAll('.compact-icons button').forEach(x=>x.classList.remove('active'));e.currentTarget.classList.add('active');drawJourney(+e.currentTarget.dataset.step);}));

const providers=[
 {name:'Gerald Molloy, MD',role:'Board-Certified Neurosurgeon',photo:'https://totalspineortho.com/wp-content/uploads/2021/08/DoctorMolloy-768x768.png',summary:'High-level surgical review for complex cervical, thoracic, and lumbar spine claims where the next step needs to be clear.',bio:{why:'Dr. Molloy is a strong referral choice when a workers’ compensation spine claim needs decisive specialist evaluation. His spine-focused practice includes minimally invasive and endoscopic spine surgery, cervical, thoracic and lumbar fusions, laser discectomy, kyphoplasty, vertebroplasty, and spinal tumor resection. For case managers, that means one referral can support advanced imaging review, surgical candidacy decisions, and a clear care direction for difficult neck and back injury claims.',best:['Herniated disc with radiculopathy','Cervical or lumbar fusion review','Compression fracture / kyphoplasty evaluation','Failed conservative spine care','Complex spine injury second opinion'],value:'Best fit for claims where the injured worker has persistent neurologic symptoms, radiating pain, weakness, stenosis, fracture, or a spine condition that may require surgical decision-making.'},tags:['Spine surgery','Complex spine claims','Minimally invasive'],url:'https://totalspineortho.com/our-physicians/dr-gerald-molloy/'},
 {name:'Brett Schlifka, DO',role:'Board-Certified Neurosurgeon',photo:'https://totalspineortho.com/wp-content/uploads/2025/07/DrSchlifka-768x768.png',summary:'Advanced spine evaluation for injured workers with disc herniations, stenosis, sciatica, scoliosis, or traumatic spine injuries.',bio:{why:'Dr. Schlifka is built for workers’ comp cases that need a careful spine roadmap. His profile highlights more than two decades of surgical expertise and treatment of herniated discs, spinal stenosis, sciatica, degenerative scoliosis, and traumatic injuries using minimally invasive techniques when appropriate. For a case manager, he is especially valuable when the claim needs a thorough imaging review, an explanation of non-surgical versus surgical options, and a practical recovery plan.',best:['Work-related neck or back injury','Sciatica or nerve compression','Spinal stenosis','Traumatic spine injury','Revision or complex spine review'],value:'Best fit when the case needs an experienced neurosurgical opinion that can help reduce uncertainty, clarify treatment options, and support return-to-function planning.'},tags:['Neurosurgery','Traumatic spine injuries','Minimally invasive'],url:'https://totalspineortho.com/our-physicians/brett-schlifka-md/'},
 {name:'Scott Glickman, DO',role:'Board-Certified Neurological Surgeon',photo:'https://totalspineortho.com/wp-content/uploads/2025/07/DoctorGlickman-768x768.png',summary:'More than two decades of surgical expertise for complex spine, revision, trauma, and pain-related neurosurgical cases.',bio:{why:'Dr. Glickman is a strong option for complex workers’ comp spine claims because his background combines board certification, multi-fellowship neurological surgery training, trauma experience, and advanced spinal surgery techniques. His Total Spine profile emphasizes endoscopic, minimally invasive, hybrid, and revision spine care, plus neurosurgical management of pain. That makes him a valuable referral when the claim is complicated, prior treatment has not resolved symptoms, or the injured worker needs a high-level surgical opinion.',best:['Complex spine injury','Revision spine surgery review','Persistent pain after prior treatment','Neurosurgical trauma history','Minimally invasive or hybrid spine options'],value:'Best fit for files where the diagnosis is complex, the prior care path is stalled, or a case manager needs a specialist who can evaluate the whole patient and define the next appropriate step.'},tags:['Complex spine','Revision review','Trauma expertise'],url:'https://totalspineortho.com/our-physicians/scott-glickman-do/'},
 {name:'Anthony Lombardo, MD',role:'Orthopedic Surgeon',photo:'https://totalspineortho.com/wp-content/uploads/2025/07/DoctorLombardo-768x768.png',summary:'Orthopedic evaluation for shoulder, knee, hip, sports medicine, arthroscopy, rotator cuff, and joint replacement claims.',bio:{why:'Dr. Lombardo is a strong referral for workers’ comp cases involving orthopedic injuries that limit mobility, lifting, walking, or return-to-duty. His profile highlights more than 25 years of specialized orthopedic experience, outpatient same-day knee and hip replacement focus, knee arthroscopy, osteoarthritis treatment, total hip replacement, and rotator cuff repair. For case managers, he helps connect the clinical problem to a functional plan: conservative care when appropriate, surgical review when needed, and a path toward restored movement.',best:['Shoulder injury / rotator cuff tear','Knee injury or meniscal pathology','Hip injury or replacement evaluation','Arthroscopy review','Persistent joint pain after conservative care'],value:'Best fit for non-spine orthopedic claims where the injured worker needs specialist evaluation, treatment planning, and clear next steps around mobility and work function.'},tags:['Orthopedics','Shoulder / knee / hip','Joint care'],url:'https://totalspineortho.com/our-physicians/anthony-lombardo-md/'},
 {name:'Aleksander “Peaches” Pecherek, DO',role:'Interventional Pain Management',photo:'https://totalspineortho.com/wp-content/uploads/2026/01/DoctorPecherek-768x768.png',summary:'Non-surgical pain and spine pathway support with fluoroscopic and ultrasound-guided procedures.',bio:{why:'Dr. Pecherek is ideal when a workers’ comp claim needs pain control, functional improvement, or a non-surgical spine pathway before considering surgery. He is board-certified in interventional pain management and physical medicine and rehabilitation, with advanced training in minimally invasive spine procedures and sports medicine. His profile highlights epidural steroid injections, medial branch blocks, radiofrequency ablations, spinal cord stimulator implantation, and other image-guided spine and joint procedures.',best:['Epidural steroid injection evaluation','Facet-mediated pain / medial branch blocks','Radiofrequency ablation pathway','Spinal cord stimulator consideration','Non-surgical spine or joint pain care'],value:'Best fit when the claim needs an interventional plan to reduce pain, improve function, document response to treatment, and determine whether continued conservative care or surgical referral is appropriate.'},tags:['Pain management','Injections','Non-surgical spine'],url:'https://totalspineortho.com/our-physicians/aleksander-pecherek-do/'},
 {name:'Vanisaben Patel, DPM',role:'Board-Certified Podiatric Surgeon',photo:'https://totalspineortho.com/wp-content/uploads/2026/01/Patel-RevisedBG-768x768.png',summary:'Foot and ankle specialist for lower-extremity injuries that affect standing, walking, job duties, and safe recovery.',bio:{why:'Dr. Patel is a strong workers’ comp referral when the injury involves the foot, ankle, gait, or lower-extremity function. Her profile highlights board certification in podiatric surgery, reconstructive surgery, sports medicine, diabetic wound care, trauma, and extensive emergency-care training treating traumatic injuries and complex conditions. For case managers, she is valuable when the claim depends on restoring weight-bearing ability, footwear tolerance, walking capacity, and safe return to activity.',best:['Ankle sprain or fracture','Foot fracture or traumatic injury','Achilles or tendon injury','Post-traumatic foot / ankle pain','Reconstructive foot or ankle surgery review'],value:'Best fit when an injured worker cannot stand, walk, climb, or perform job demands because of a foot or ankle condition that needs focused specialist management.'},tags:['Foot & ankle','Trauma','Return to walking'],url:'https://totalspineortho.com/our-physicians/vanisaben-patel-dpm/'},
 {name:'Joe Perry, PA-C',role:'Orthopedic Physician Assistant',photo:'https://totalspineortho.com/wp-content/uploads/2025/07/joe-768x768.webp',summary:'Orthopedic PA support for diagnosis, follow-up, treatment coordination, and keeping active claims moving.',bio:{why:'Joe Perry is valuable to workers’ comp case managers because he brings more than 25 years of orthopedic clinical diagnosis and treatment experience, including occupational medicine, orthopedic medicine, and orthopedic trauma. His profile lists experience with knee, shoulder, elbow, ankle, hip, wrist, patella, clavicle, and pediatric fracture injuries. He can help injured workers move through evaluation, follow-up, preoperative preparation, postoperative care, and treatment coordination without unnecessary delays.',best:['Knee, shoulder, elbow, ankle, hip, or wrist injuries','Orthopedic trauma follow-up','Pre-op and post-op coordination','Clinical diagnosis support','Active claim continuity'],value:'Best fit for keeping orthopedic claims organized, communicating the plan, and supporting continuity between physician evaluation, treatment authorization, and follow-up.'},tags:['Orthopedic support','Trauma follow-up','Care coordination'],url:'https://totalspineortho.com/our-physicians/joe-perry/'}
];
const providerWall=document.getElementById('providerWall');
function initials(name){return name.split(' ').map(w=>w[0]).join('').replace(/[“”]/g,'').slice(0,2);}
if(providerWall){
 providerWall.innerHTML=providers.map((p,i)=>`<article class="provider-card provider-photo-card" role="button" tabindex="0" data-provider="${i}" aria-label="Open bio for ${p.name}"><div class="provider-avatar provider-photo"><img src="${p.photo}" alt="${p.name}" loading="lazy" onerror="this.parentElement.classList.add('photo-failed');this.remove();"/><span class="fallback-initials">${initials(p.name)}</span></div><p class="eyebrow">${p.role}</p><h3>${p.name}</h3><p>${p.summary}</p><div class="tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div><button class="bio-button" type="button">Read Bio <span>→</span></button></article>`).join('');
 providerWall.querySelectorAll('[data-provider]').forEach(card=>{
  card.addEventListener('click',()=>openProviderBio(+card.dataset.provider));
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openProviderBio(+card.dataset.provider);}});
 });
}

const providerModal=document.createElement('div');
providerModal.className='provider-modal';
providerModal.setAttribute('aria-hidden','true');
providerModal.innerHTML=`<div class="provider-modal-glow"></div><div class="provider-modal-card" role="dialog" aria-modal="true" aria-labelledby="providerBioName"><button class="provider-modal-close" type="button" aria-label="Close provider bio">×</button><div class="provider-bio-layout"><div class="provider-bio-photo"><img id="providerBioPhoto" alt="" /></div><div class="provider-bio-copy"><p class="eyebrow" id="providerBioRole"></p><h3 id="providerBioName"></h3><div class="wc-bio-section"><h4>Why Workers' Comp Case Managers Refer This Provider</h4><p id="providerBioWhy"></p></div><div class="wc-bio-section"><h4>Best Referral For</h4><ul id="providerBioBest"></ul></div><div class="wc-bio-section"><h4>What This Means for Your Claim</h4><p id="providerBioValue"></p></div><div class="tags" id="providerBioTags"></div><a class="bio-link refer-link" href="https://totalspineortho.com/work-comp-referral/" target="_blank" rel="noreferrer">Refer a Patient <span>→</span></a><a id="providerBioLink" class="bio-link secondary-bio-link" href="#" target="_blank" rel="noopener">View source profile <span>↗</span></a></div></div></div>`;
document.body.appendChild(providerModal);
const providerClose=providerModal.querySelector('.provider-modal-close');
function openProviderBio(index){
 const p=providers[index]; if(!p) return;
 providerModal.querySelector('#providerBioPhoto').src=p.photo;
 providerModal.querySelector('#providerBioPhoto').alt=p.name;
 providerModal.querySelector('#providerBioRole').textContent=p.role;
 providerModal.querySelector('#providerBioName').textContent=p.name;
 providerModal.querySelector('#providerBioWhy').textContent=p.bio.why;
 providerModal.querySelector('#providerBioBest').innerHTML=p.bio.best.map(item=>`<li>${item}</li>`).join('');
 providerModal.querySelector('#providerBioValue').textContent=p.bio.value;
 providerModal.querySelector('#providerBioTags').innerHTML=p.tags.map(t=>`<span>${t}</span>`).join('');
 providerModal.querySelector('#providerBioLink').href=p.url;
 providerModal.querySelector('.refer-link').onclick=()=>{closeProviderBio();};
 providerModal.classList.add('open');
 providerModal.setAttribute('aria-hidden','false');
 providerClose.focus();
}
function closeProviderBio(){providerModal.classList.remove('open');providerModal.setAttribute('aria-hidden','true');}
providerClose.addEventListener('click',closeProviderBio);
providerModal.addEventListener('click',e=>{if(e.target===providerModal)closeProviderBio();});

let idle=0;setInterval(()=>{if(!userSelectedRegion && document.getElementById('home')?.classList.contains('active')){const keys=['cervical','thoracic','lumbar','sacrum'];idle=(idle+1)%keys.length;setRegion(keys[idle]);}},4600);

const videoModal=document.getElementById('videoModal');
const closeVideo=document.getElementById('closeVideo');
const modalFrame=document.getElementById('modalVideoFrame');
function showVideo(){videoModal?.classList.add('open');videoModal?.setAttribute('aria-hidden','false');if(modalFrame){modalFrame.currentTime=0;modalFrame.play().catch(()=>{});}}
function hideVideo(){videoModal?.classList.remove('open');videoModal?.setAttribute('aria-hidden','true');if(modalFrame){modalFrame.pause();modalFrame.currentTime=0;}}
['openVideo','openVideoInline'].forEach(id=>document.getElementById(id)?.addEventListener('click',showVideo));
closeVideo?.addEventListener('click',hideVideo);
videoModal?.addEventListener('click',e=>{if(e.target===videoModal)hideVideo();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideVideo();closeProviderBio();}});

setRegion('cervical');
