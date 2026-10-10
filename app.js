const sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => 'PKR ' + Number(n).toLocaleString();
const intl = p => '+92' + p.slice(1);

function contactList(){
  return `<ul class="ci">
  ${CONFIG.PHONES.map(p=>`<li>Phone: <a href="tel:${intl(p)}">${p}</a> (<a href="https://wa.me/${intl(p).slice(1)}">WhatsApp</a>)</li>`).join('')}
  <li>Email: <a href="mailto:${esc(CONFIG.EMAIL)}">${esc(CONFIG.EMAIL)}</a></li>
  <li>Office: ${esc(CONFIG.ADDRESS)}</li>
  <li>Plus code: ${esc(CONFIG.PLUS)}</li>
  <li>Instagram: <a href="https://instagram.com/${CONFIG.INSTA}">@${CONFIG.INSTA}</a></li>
  <li>Facebook: <a href="https://facebook.com/${CONFIG.FB}">${CONFIG.FB}</a></li></ul>`;
}

function chrome(active){
  const pages=[['index.html','Home','home'],['listings.html','Listings','listings'],['quote.html','Request a quote','quote'],['contact.html','Contact','contact']];
  const logo='<img class="lg" src="images/logo.png" alt="" onerror="this.remove()">';
  document.getElementById('top').innerHTML=`<div class="wrap"><a class="logo" href="index.html">${logo}${esc(CONFIG.COMPANY)}</a><nav>${pages.map(p=>`<a href="${p[0]}" class="${p[2]===active?'on':''}">${p[1]}</a>`).join('')}</nav></div>`;
  const map='https://maps.google.com/maps?q='+encodeURIComponent(CONFIG.PLUS)+'&z=16&output=embed';
  document.getElementById('foot').innerHTML=`<div class="wrap"><div class="fgrid">
  <div>${logo}<h4>${esc(CONFIG.COMPANY)}</h4><p>Trusted property dealers in Bahria Town Karachi. Buying, selling and renting, handled personally by our team.</p></div>
  <div><h4>Contact us</h4>${contactList()}</div>
  <div><h4>Find our office</h4><iframe src="${map}" title="Office map" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div>
  <div class="copy">&copy; ${new Date().getFullYear()} ${esc(CONFIG.COMPANY)}. All rights reserved. <a href="admin.html">Owner login</a></div></div>`;
}

function gallery(l){
  const imgs = l.images?.length ? l.images : (l.image_url ? [l.image_url] : []);
  const arrows = imgs.length>1 ? '<button class="ar l" data-d="-1" aria-label="Previous photo">&#8249;</button><button class="ar r" data-d="1" aria-label="Next photo">&#8250;</button>' : '';
  return `<div class="gal"><div class="trk">${imgs.map(u=>`<img src="${esc(u)}" alt="${esc(l.title)}" loading="lazy">`).join('')||'<div class="noimg"></div>'}</div>${arrows}</div>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('.ar');if(!b)return;const t=b.parentElement.querySelector('.trk');t.scrollBy({left:b.dataset.d*t.clientWidth,behavior:'smooth'})});

function card(l){
  const sold = l.status==='sold';
  return `<article class="card">${gallery(l)}<div class="cb">
    ${sold?'<span class="sold">Sold</span>':''}<p class="price">${money(l.price)}</p><h3>${esc(l.title)}</h3><p class="loc">${esc(l.location)}</p>
    <div class="spec"><span>${esc(l.beds)} beds</span><span>${esc(l.baths)} baths</span><span>${esc(l.sqft)} sqft</span></div>
    ${l.description?`<p>${esc(l.description)}</p>`:''}
    ${sold?'':`<a class="btn" href="quote.html?listing=${esc(l.id)}">Request a quote</a>`}</div></article>`;
}

async function loadListings(el, limit){
  let q = sb.from('listings').select('*').order('created_at',{ascending:false});
  if(limit) q = q.eq('status','available').limit(limit);
  const {data,error} = await q;
  el.innerHTML = error ? `<p class="msg err">Could not load listings.</p>` : data.length ? data.map(card).join('') : '<p>No listings yet. Check back soon.</p>';
}

function handleForm(form, type, withListing){
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const out=form.querySelector('.out'), btn=form.querySelector('button');
    const v=Object.fromEntries(new FormData(form));
    btn.disabled=true;
    const row={name:v.name,email:v.email,phone:v.phone||null,message:v.message||null,type};
    if(withListing && v.listing_id) row.listing_id=v.listing_id;
    const {error}=await sb.from('quotes').insert(row);
    btn.disabled=false;
    if(error){out.className='out msg err';out.textContent='Something went wrong. Please try again.';return}
    form.reset();out.className='out msg ok';out.textContent=type==='quote'?'Quote request sent. We will contact you soon.':'Message sent. Thank you!';
  });
}
