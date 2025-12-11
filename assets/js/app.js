// ==========================================
// GLOBAL DEĞİŞKENLER VE AYARLAR
// ==========================================
let isEditMode = false;
const eklemeModalEl = document.getElementById('eklemeModal');
const kategoriModalEl = document.getElementById('kategoriModal');

let bsEklemeModal;
let bsKategoriModal;

document.addEventListener('DOMContentLoaded', () => {
    bsEklemeModal = new bootstrap.Modal(eklemeModalEl);
    bsKategoriModal = new bootstrap.Modal(kategoriModalEl);
    init();
});

// ==========================================
// BAŞLATMA
// ==========================================
function init() {
    temaYukle();
    
    let kayitliVeri = localStorage.getItem('myStartPageData');
    let veriSeti;

    if (kayitliVeri) {
        veriSeti = JSON.parse(kayitliVeri);
    } else {
        veriSeti = defaultData;
        localStorage.setItem('myStartPageData', JSON.stringify(defaultData));
    }

    renderLinks(veriSeti);
    
    setTimeout(gununOnerisiniGetir, 1500);
}

// ==========================================
// ANA EKRAN RENDER
// ==========================================
function renderLinks(veri) {
    const container = document.getElementById('link-container');
    container.innerHTML = '';

    for (let i = 1; i <= 3; i++) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-lg-4';

        const sutunKategorileri = veri.filter(item => item.kolon === i);

        sutunKategorileri.forEach(kategori => {
            
            const isAcik = (kategori.acikMi !== undefined) ? kategori.acikMi : true;
            const eyeIcon = isAcik ? 'fa-eye' : 'fa-eye-slash';
            const bodyClass = isAcik ? '' : 'd-none';
            const opacityClass = isAcik ? '' : 'opacity-50';

            const cardHTML = `
                <div class="card mb-4 shadow-sm border-0 bg-body-tertiary"> <div class="card-header border-0 d-flex justify-content-between align-items-center py-2 bg-body-secondary">
            
                      <h6 class="m-0 fw-semibold text-body ${opacityClass}"> ${kategori.baslik}
                      </h6>

                      <button class="btn btn-sm text-body-secondary p-0" 
                              onclick="kategoriAcKapa(${kategori.id})"
                              title="${isAcik ? 'Gizle' : 'Göster'}">
                          <i class="fa-solid ${eyeIcon}"></i>
                      </button>
                  </div>
                  
                  <div class="card-body ${bodyClass}">
                      <div class="d-flex justify-content-center flex-wrap gap-2">
                          ${generateLinksHTML(kategori.linkler, kategori.id)}
                      </div>
                  </div>
              </div>
            `;
            colDiv.innerHTML += cardHTML;
        });
        container.appendChild(colDiv);
    }
}

function generateLinksHTML(linklerDizisi, kategoriId) {
    return linklerDizisi.map((link, index) => {
        let imgTag = '';
        if (link.url.includes('localhost') || link.url.includes('127.0.0.1')) {
            imgTag = `<i class="fa-solid fa-server fs-2 text-secondary"></i>`;
        } else {
            imgTag = `<img src="https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${link.url}&size=32" width="32" height="32" alt="${link.ad}" style="opacity: 0.8;">`;
        }

        let actionAttr = '';
        let editTools = '';

        if (isEditMode) {
            actionAttr = `href="javascript:void(0)" onclick="linkDuzenleAc(${kategoriId}, ${index})"`;
            const showLeft = index > 0;
            const showRight = index < linklerDizisi.length - 1;

            editTools = `
                <div class="delete-btn" onclick="linkSil(event, ${kategoriId}, ${index})">
                    <i class="fa-solid fa-times"></i>
                </div>
                ${showLeft ? `<div class="sort-btn sort-left" onclick="linkTasi(event, ${kategoriId}, ${index}, 'sol')"><i class="fa-solid fa-chevron-left"></i></div>` : ''}
                ${showRight ? `<div class="sort-btn sort-right" onclick="linkTasi(event, ${kategoriId}, ${index}, 'sag')"><i class="fa-solid fa-chevron-right"></i></div>` : ''}
            `;
        } else {
            actionAttr = `href="${link.url}" target="_blank"`;
        }

        return `
            <div class="position-relative mb-2">
                ${editTools}
                <a ${actionAttr} 
                   class="btn bg-opacity-25 border border-secondary border-opacity-25 d-flex align-items-center gap-2 text-decoration-none text-light btn-sm btn-link-custom"
                   title="${link.ad}">
                   ${imgTag}
                </a>
            </div>
        `;
    }).join('');
}

// ==========================================
// YENİ EKLENEN: GİZLE / GÖSTER FONKSİYONU
// ==========================================
function kategoriAcKapa(id) {
    let veri = JSON.parse(localStorage.getItem('myStartPageData'));
    const kat = veri.find(k => k.id === id);
    
    if(kat) {
        const mevcutDurum = (kat.acikMi !== undefined) ? kat.acikMi : true;
        kat.acikMi = !mevcutDurum;

        localStorage.setItem('myStartPageData', JSON.stringify(veri));
        renderLinks(veri);
    }
}

// ==========================================
// LİNK İŞLEMLERİ
// ==========================================
function toggleEditMode() {
    isEditMode = !isEditMode;
    const btn = document.getElementById('btnEditMode');

    if (isEditMode) {
        btn.classList.replace('btn-secondary', 'btn-warning');
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        document.body.classList.add('edit-mode');
    } else {
        btn.classList.replace('btn-warning', 'btn-secondary');
        btn.innerHTML = '<i class="fa-solid fa-gear"></i>';
        document.body.classList.remove('edit-mode');
    }

    const veri = JSON.parse(localStorage.getItem('myStartPageData'));
    renderLinks(veri);
}

function linkSil(event, katId, linkIndex) {
    event.stopPropagation();
    if(confirm('Bu linki silmek istediğine emin misin?')) {
        let veri = JSON.parse(localStorage.getItem('myStartPageData'));
        const kat = veri.find(k => k.id === katId);
        if(kat) {
            kat.linkler.splice(linkIndex, 1);
            localStorage.setItem('myStartPageData', JSON.stringify(veri));
            renderLinks(veri);
        }
    }
}

function linkTasi(event, katId, index, yon) {
    event.stopPropagation();
    let veri = JSON.parse(localStorage.getItem('myStartPageData'));
    const kat = veri.find(k => k.id === katId);
    
    if(!kat) return;

    let hedefIndex = index;
    if (yon === 'sol' && index > 0) hedefIndex = index - 1;
    else if (yon === 'sag' && index < kat.linkler.length - 1) hedefIndex = index + 1;

    if (hedefIndex !== index) {
        [kat.linkler[index], kat.linkler[hedefIndex]] = [kat.linkler[hedefIndex], kat.linkler[index]];
        localStorage.setItem('myStartPageData', JSON.stringify(veri));
        renderLinks(veri);
    }
}

function linkDuzenleAc(katId, linkIndex) {
    kategorileriSelectDoldur();
    let veri = JSON.parse(localStorage.getItem('myStartPageData'));
    const kat = veri.find(k => k.id === katId);
    const link = kat.linkler[linkIndex];

    document.getElementById('inpKategori').value = katId;
    document.getElementById('inpAd').value = link.ad;
    document.getElementById('inpUrl').value = link.url;
    document.getElementById('editModeTarget').value = `${katId}-${linkIndex}`;

    document.querySelector('#eklemeModal .modal-title').innerText = "Linki Düzenle";
    bsEklemeModal.show();
}

function yeniLinkKaydet() {
    const katId = parseInt(document.getElementById('inpKategori').value);
    const ad = document.getElementById('inpAd').value;
    const url = document.getElementById('inpUrl').value;
    const editTarget = document.getElementById('editModeTarget').value;

    if (!ad || !url) { alert("Lütfen alanları doldurun."); return; }

    let veri = JSON.parse(localStorage.getItem('myStartPageData'));
    const hedefKategori = veri.find(k => k.id === katId);

    if (hedefKategori) {
        if (editTarget === "") {
            hedefKategori.linkler.push({ ad: ad, url: url });
        } else {
            const [eskiKatId, linkIndex] = editTarget.split('-').map(Number);
            if(eskiKatId === katId) {
                hedefKategori.linkler[linkIndex].ad = ad;
                hedefKategori.linkler[linkIndex].url = url;
            } else {
                const eskiKategori = veri.find(k => k.id === eskiKatId);
                eskiKategori.linkler.splice(linkIndex, 1);
                hedefKategori.linkler.push({ ad: ad, url: url });
            }
        }
        localStorage.setItem('myStartPageData', JSON.stringify(veri));
        renderLinks(veri);
        
        document.getElementById('eklemeFormu').reset();
        document.getElementById('editModeTarget').value = "";
        bsEklemeModal.hide();
    }
}

// ==========================================
// KATEGORİ İŞLEMLERİ
// ==========================================
function kategoriYonetiminiAc() {
    kategoriListesiniRenderEt();
    kategoriFormuSifirla();
    bsKategoriModal.show();
}

function kategoriListesiniRenderEt() {
    const listeKutusu = document.getElementById('kategoriListesi');
    let veri = JSON.parse(localStorage.getItem('myStartPageData'));
    
    listeKutusu.innerHTML = ''; 

    for(let i=1; i<=3; i++) {
        const sutunKats = veri.filter(k => k.kolon === i);
        
        if(sutunKats.length > 0) {
            listeKutusu.innerHTML += `<div class="border-bottom border-secondary mt-3 mb-2 small">Sütun ${i}</div>`;
        }

        sutunKats.forEach((kat, index) => {
            const isFirst = (index === 0);
            const isLast = (index === sutunKats.length - 1);

            const upBtn = isFirst ? '' : 
                `<button class="btn btn-xs border-secondary me-1" onclick="kategoriTasi(${kat.id}, 'yukari')"><i class="fa-solid fa-chevron-up"></i></button>`;
            
            const downBtn = isLast ? '' : 
                `<button class="btn btn-xs border-secondary me-1" onclick="kategoriTasi(${kat.id}, 'asagi')"><i class="fa-solid fa-chevron-down"></i></button>`;

            const item = document.createElement('div');
            item.className = 'list-group-item border-secondary d-flex justify-content-between align-items-center py-2';
            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="d-flex flex-row udbtns me-3">
                        ${upBtn} ${downBtn}
                    </div>
                    <div>
                        <span class="fw-bold">${kat.baslik}</span>
                        <span class="small ms-2">(${kat.linkler.length} Link)</span>
                    </div>
                </div>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-theme" onclick="kategoriDuzenleHazirla(${kat.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-theme" onclick="kategoriSil(${kat.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            listeKutusu.appendChild(item);
        });
    }
}

function kategoriTasi(id, yon) {
    let veri = JSON.parse(localStorage.getItem('myStartPageData'));
    const index = veri.findIndex(k => k.id === id);
    if(index === -1) return;
    
    const aktifKategori = veri[index];
    const hedefKolon = aktifKategori.kolon;

    const ayniSutundakiler = veri
        .map((k, i) => ({...k, orjIndex: i}))
        .filter(k => k.kolon === hedefKolon);
    
    const localIndex = ayniSutundakiler.findIndex(k => k.id === id);
    
    let hedefLocalIndex = -1;
    if(yon === 'yukari' && localIndex > 0) {
        hedefLocalIndex = localIndex - 1;
    } else if (yon === 'asagi' && localIndex < ayniSutundakiler.length - 1) {
        hedefLocalIndex = localIndex + 1;
    }

    if(hedefLocalIndex !== -1) {
        const indexA = ayniSutundakiler[localIndex].orjIndex;
        const indexB = ayniSutundakiler[hedefLocalIndex].orjIndex;

        const temp = veri[indexA];
        veri[indexA] = veri[indexB];
        veri[indexB] = temp;

        localStorage.setItem('myStartPageData', JSON.stringify(veri));
        renderLinks(veri);
        kategoriListesiniRenderEt();
    }
}

function kategoriKaydet() {
    const idInput = document.getElementById('catEditId').value;
    const ad = document.getElementById('catAd').value;
    const kolon = parseInt(document.getElementById('catKolon').value);

    if(!ad) { alert("Lütfen kategori adı girin."); return; }

    let veri = JSON.parse(localStorage.getItem('myStartPageData'));

    if(idInput) {
        const kat = veri.find(k => k.id == idInput);
        if(kat) {
            kat.baslik = ad;
            kat.kolon = kolon;
        }
    } else {
        veri.push({
            id: Date.now(),
            baslik: ad,
            kolon: kolon,
            acikMi: true,
            linkler: []
        });
    }

    localStorage.setItem('myStartPageData', JSON.stringify(veri));
    renderLinks(veri);
    kategoriListesiniRenderEt();
    kategoriFormuSifirla();
}

function kategoriDuzenleHazirla(id) {
    let veri = JSON.parse(localStorage.getItem('myStartPageData'));
    const kat = veri.find(k => k.id == id);

    if(kat) {
        document.getElementById('catEditId').value = kat.id;
        document.getElementById('catAd').value = kat.baslik;
        document.getElementById('catKolon').value = kat.kolon;

        document.getElementById('catFormTitle').innerText = "Kategoriyi Düzenle";
        document.getElementById('catFormTitle').className = "card-title text-warning mb-3";
        document.getElementById('catCancelBtn').classList.remove('d-none');
    }
}

function kategoriFormuSifirla() {
    document.getElementById('catEditId').value = '';
    document.getElementById('catAd').value = '';
    document.getElementById('catKolon').value = '1';
    
    document.getElementById('catFormTitle').innerText = "Yeni Kategori Ekle";
    document.getElementById('catFormTitle').className = "card-title text-info mb-3";
    document.getElementById('catCancelBtn').classList.add('d-none');
}

function kategoriSil(id) {
    if(confirm('Bu kategoriyi ve içindeki tüm linkleri silmek istediğine emin misin?')) {
        let veri = JSON.parse(localStorage.getItem('myStartPageData'));
        const yeniVeri = veri.filter(k => k.id != id);
        localStorage.setItem('myStartPageData', JSON.stringify(yeniVeri));
        
        renderLinks(yeniVeri);
        kategoriListesiniRenderEt();
    }
}

function kategorileriSelectDoldur() {
    const selectKutu = document.getElementById('inpKategori');
    selectKutu.innerHTML = '';
    const guncelVeri = JSON.parse(localStorage.getItem('myStartPageData'));
    
    guncelVeri.forEach(kat => {
        const option = document.createElement('option');
        option.value = kat.id;
        option.text = kat.baslik;
        selectKutu.appendChild(option);
    });
}

eklemeModalEl.addEventListener('show.bs.modal', function () {
    if(document.getElementById('editModeTarget').value === "") {
        kategorileriSelectDoldur();
        document.querySelector('#eklemeModal .modal-title').innerText = "Yeni Link Ekle";
    }
});

eklemeModalEl.addEventListener('hidden.bs.modal', function () {
    document.getElementById('eklemeFormu').reset();
    document.getElementById('editModeTarget').value = "";
});

document.querySelector('input[type="text"]').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const query = this.value;
        if(query) {
            window.open(`https://www.google.com/search?q=${query}`, '_blank');
            this.value = '';
        }
    }
});

// ==========================================
// YEDEKLEME İŞLEMLERİ (IMPORT / EXPORT)
// ==========================================

// 1. YEDEK AL (EXPORT)
function yedekAl() {
    const veri = localStorage.getItem('myStartPageData');
    
    if (!veri) {
        alert("Yedeklenecek veri bulunamadı!");
        return;
    }

    const blob = new Blob([veri], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const tarih = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `startpage_yedek_${tarih}.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 2. YEDEK YÜKLE (IMPORT)
function yedekYukle(inputElement) {
    const dosya = inputElement.files[0];
    
    if (!dosya) return;

    if (!confirm("DİKKAT!\n\nBu dosyayı yüklerseniz mevcut tüm linkleriniz ve ayarlarınız SİLİNECEK ve bu dosyadakilerle değiştirilecektir.\n\nOnaylıyor musunuz?")) {
        inputElement.value = '';
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const icerik = e.target.result;
            
            const jsonVeri = JSON.parse(icerik);
            
            if (Array.isArray(jsonVeri) && jsonVeri.length > 0 && jsonVeri[0].hasOwnProperty('id')) {
                localStorage.setItem('myStartPageData', JSON.stringify(jsonVeri));
                alert("Yedek başarıyla yüklendi! Sayfa yenileniyor...");
                location.reload();
            } else {
                throw new Error("Geçersiz veri formatı");
            }

        } catch (hata) {
            alert("HATA: Seçilen dosya geçerli bir StartPage yedeği değil.\n\n" + hata.message);
        }
    };

    reader.readAsText(dosya);
    inputElement.value = '';
}

// ==========================================
// TEMA YÖNETİMİ
// ==========================================
function temaDegistir() {
    const htmlTag = document.documentElement;
    const currentTheme = htmlTag.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlTag.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('myStartPageTheme', newTheme);
    
    temaIkonuGuncelle(newTheme);
}

function temaYukle() {
    const savedTheme = localStorage.getItem('myStartPageTheme') || 'dark';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    temaIkonuGuncelle(savedTheme);
}

function temaIkonuGuncelle(tema) {
    const btn = document.getElementById('btnTheme');
    if(btn) {
        if(tema === 'dark') {
            btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            btn.classList.replace('btn-warning', 'btn-secondary');
            btn.classList.add('text-white');
        } else {
            btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            btn.classList.replace('btn-secondary', 'btn-warning');
            btn.classList.remove('text-white');
        }
    }
}

// ==========================================
// GÜNÜN ÖNERİSİ SİSTEMİ
// ==========================================
const ONERI_URL = "https://raw.githubusercontent.com/militiaweb/addgoo/refs/heads/main/oneriler.json"; 

async function gununOnerisiniGetir() {
    const bugun = new Date().toISOString().slice(0, 10);
    const sonGosterim = localStorage.getItem('lastSuggestionDate');

    if (sonGosterim === bugun) {
        return; 
    }

    try {
        const response = await fetch(ONERI_URL);
        const tumOneriler = await response.json();
        const veri = tumOneriler.find(item => item.tarih === bugun);
        
        if (!veri) {
            return;
        }
        
        document.getElementById('oneriBaslik').innerText = veri.baslik;
        document.getElementById('oneriAciklama').innerText = veri.aciklama;
        document.getElementById('oneriLink').href = veri.url;

        window.aktifOneri = veri;

        const toastEl = document.getElementById('oneriToast');
        toastEl.classList.add('bg-body-tertiary', 'text-body'); 
        
        const toast = new bootstrap.Toast(toastEl, { autohide: false });
        toast.show();

        localStorage.setItem('lastSuggestionDate', bugun);

    } catch (error) {
        console.error("Öneri çekilemedi:", error);
    }
}

function oneriyiEkle() {
    if(!window.aktifOneri) return;

    const veri = window.aktifOneri;
    kategorileriSelectDoldur();

    document.getElementById('inpKategori').value = veri.kategoriId || 1; 
    document.getElementById('inpAd').value = veri.baslik.split(':')[1] ? veri.baslik.split(':')[1].trim() : veri.baslik;
    document.getElementById('inpUrl').value = veri.url;
    
    document.getElementById('editModeTarget').value = "";
    document.querySelector('#eklemeModal .modal-title').innerText = "Öneriyi Kaydet";

    bsEklemeModal.show();
    
    const toastEl = document.getElementById('oneriToast');
    const toastInstance = bootstrap.Toast.getInstance(toastEl);
    toastInstance.hide();
}

const gon = document.getElementById('gon');
gon.addEventListener("click", function (e) {
  localStorage.removeItem('lastSuggestionDate');
  gununOnerisiniGetir();
})