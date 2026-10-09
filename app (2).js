const sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => '$' + Number(n).toLocaleString();

function chrome(active){
  const pages=[['index.html','Home','home'],['listings.html','Listings','listings'],['quote.html','Request a quote','quote'],['contact.html','Contact','contact']];
  document.getElementById('top').innerHTML=`<div class="wrap"><a class="logo" href="index.html">${esc(CONFIG.COMPANY)}</a><nav>${pages.map(p=>`<a href="${p[0]}" class="${p[2]===active?'on':''}">${p[1]}</a>`).join('')}</nav></div>`;
  document.getElementById('foot').innerHTML=`<div class="wrap">&copy; ${new Date().getFullYear()} ${esc(CONFIG.COMPANY)}. <a href="admin.html">Owner login</a></div>`;
}

function card(l){
  const sold = l.status==='sold';
  return `<article class="card"><img src="${esc(l.image_url||'')}" alt="${esc(l.title)}" loading="lazy"><div class="cb">
    ${sold?'<span class="sold">Sold</span>':''}<p class="price">${money(l.price)}</p><h3>${esc(l.title)}</h3><p class="loc">${esc(l.location)}</p>
    <div class="spec"><span>${esc(l.beds)} beds</span><span>${esc(l.baths)} baths</span><span>${esc(l.sqft)} sqft</span></div>
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
