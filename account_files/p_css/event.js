/* コンポーネント */
/* Loader */
// ローダーの生成
function createLoader(element) {
    // bodyの要素を取得
    const body = document.getElementsByTagName('body')[0];
    // 要素の生成
    const loader = document.createElement('div');
    const contents = document.createElement('div');
    const circle1 = document.createElement('div');
    const circle2 = document.createElement('div');
    const circle3 = document.createElement('div');
    const shadow1 = document.createElement('div');
    const shadow2 = document.createElement('div');
    const shadow3 = document.createElement('div');
    const text = document.createElement('div');
    const p = document.createElement('p');

    // クラスの付与
    loader.classList.add('c_loader');
    contents.classList.add('c_loader_contents');
    circle1.classList.add('c_loader_circle');
    circle2.classList.add('c_loader_circle');
    circle3.classList.add('c_loader_circle');
    shadow1.classList.add('c_loader_shadow');
    shadow2.classList.add('c_loader_shadow');
    shadow3.classList.add('c_loader_shadow');
    text.classList.add('c_loader_text');
    p.classList.add('c_typo_headerL', 'c_typo_WHT', 'c_typo_align_center');
    p.innerHTML = element;

    // 要素の階層化
    contents.appendChild(circle1);
    contents.appendChild(circle2);
    contents.appendChild(circle3);
    contents.appendChild(shadow1);
    contents.appendChild(shadow2);
    contents.appendChild(shadow3);
    text.appendChild(p);
    loader.appendChild(contents);
    loader.appendChild(text);
    body.appendChild(loader);
}

// ローダーの非表示
function hideLoader() {
    // ローダー要素の取得
    const loader = document.getElementsByClassName('c_loader')[0];
    // ローダーを非表示
    if (!loader.classList.contains('c_loader_hidden')) {
        loader.classList.add('c_loader_hidden');
    }
}

// ローダーの表示
function showLoader() {
    // ローダー要素の取得
    const loader = document.getElementsByClassName('c_loader')[0];
    // ローダーを表示
    if (loader.classList.contains('c_loader_hidden')) {
        loader.classList.remove('c_loader_hidden');
    }
}

/* Button */
window.addEventListener('DOMContentLoaded', function () {
    if (document.getElementsByClassName('c_button')) {
        const btn = document.getElementsByClassName('c_button');
        for (let i = 0; i < btn.length; i++) {
            if (btn[i].classList.contains('c_button_disabled')) {
                btn[i].tabIndex = -1;
            }
        }
    }
});


/* Dialog */
if (!document.getElementsByClassName('c_dialog').length) {
    //該当の要素がない場合は処理を行なわない
} else {
    // ダイアログ表示処理
    function showModalDialog01(targetDialogArea) {
        // ダイアログウィンドウ表示
        targetDialogArea.classList.add('c_dialog_isShow');
        //iPhoneの場合Bodyでposition:fixedの必要あり
        document.body.style.top = '-' + window.scrollY + 'px';
        // 背景固定
        document.body.classList.add('c_dialog_bodyScroll');
        // 高さ設定
        setMaxHeightModal01(targetDialogArea);
    }

    // ダイアログ非表示処理
    function closeModalDialog01(targetDialogArea) {
        // スクロール位置を戻すための処理 
        scrollMove = document.body.style.getPropertyValue('top');
        if (scrollMove != '') {
            scrollMove = scrollMove.replace('-', '');
            scrollMove = scrollMove.replace('px', '');
            // ダイアログウィンドウ非表示
            targetDialogArea.classList.remove('c_dialog_isShow');
            // 背景固定解除
            document.body.classList.remove('c_dialog_bodyScroll');
            document.body.style.removeProperty('top');
            // スクロール位置を戻す
            window.scrollTo(0, scrollMove);
        }
    }

    // ダイアログ表示時用 高さ設定処理
    function setMaxHeightModal01(targetDialogArea) {
        const modalMaxHeight = 680;
        targetArea = targetDialogArea.getElementsByClassName('c_dialog_textArea')[0];
        //iphoneではheightがvhの場合、アドレスバーが表示エリアに含まれないためこちらでheightを指定
        targetDialogArea.style.height = window.innerHeight + 'px';
        //textAreaも上記同様の理由でmax-heightを指定
        //本来は64pxだがスクロールバーの表示調整でCSS側の「dialog_inner」の上下paddingが62pxのため計算値もあわせる
        targetArea.style.maxHeight = ((window.innerHeight * 0.9) - 62) + 'px';
        // ダイアログのダイアログボックスの高さは最大680px
        // ただし、PC時かつウィンドウの高さの90%が上記の高さより小さい場合は、
        // ウィンドウの90%をダイアログボックスの高さとする
        if (!window.matchMedia('(max-width: 760px)').matches) {
            if (window.innerHeight * 0.9 < modalMaxHeight) {
                //90%未満のときは指定したmax-heightを使用
            } else {
                //CSSで指定したmax-heightとするため削除
                targetArea.style.removeProperty('max-height');
            }
        }
    }

    // ページ表示時に各種イベント登録
    window.addEventListener('DOMContentLoaded', function () {
        // ダイアログウィンドウの表示制御 
        const showModal = document.getElementsByClassName('c_dialog_showModal');
        for (let i = 0; i < showModal.length; i++) {
            showModal[i].addEventListener('click', function () {
                showModalDialog01(this.nextElementSibling);
            });
        }

        // ダイアログウィンドウの非表示制御（×ボタン押下時）
        const closeBtn = document.getElementsByClassName('c_dialog_CloseBtn');
        for (let i = 0; i < closeBtn.length; i++) {
            closeBtn[i].addEventListener('click', function () {
                closeModalDialog01(this.parentElement.parentElement);
            });
        }

        // ダイアログウィンドウの非表示制御（背景押下時）
        const closeModal = document.getElementsByClassName('c_dialog_modal');
        for (let i = 0; i < closeModal.length; i++) {
            closeModal[i].addEventListener('click', function (e) {
                // IEの場合、×ボタン押下時にdiv要素全体の押下イベントも実行されてしまうため×ボタン押下か否かを判定
                if (undefined != e.target.classList) {
                    // 押下箇所が背景の場合 かつ 非活性制御がない場合はダイアログを閉じる
                    if (e.target.classList.contains('c_dialog_modal') && !(e.target.classList.contains('c_dialog_modal_disable'))) {
                        closeModalDialog01(this);
                    }
                }
            });
        }

        // リサイズ時 高さ再設定
        window.addEventListener('resize', function () {
            if (document.getElementsByClassName('c_dialog_isShow').length) {
                setMaxHeightModal01(document.getElementsByClassName('c_dialog_isShow')[0]);
            }
        });
    });
}

/* Notification */
if (document.getElementsByClassName('c_notification')) {
    const notification = document.getElementsByClassName('c_notification');

    for (let i = 0; i < notification.length; i++) {
        const closeIcon = notification[i].getElementsByClassName('c_notification_closeBtn')[0].firstElementChild;
        closeIcon.addEventListener('click', function () {
            this.parentElement.parentElement.parentElement.classList.remove('bl_showLoginError');
        });
    }
}