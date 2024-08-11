/** アカウント一覧 **/

/* ↓開発用URL */
const IDLIST_GAS_URL = 'https://script.google.com/macros/s/AKfycbyjYdFnxx5UZ0TEmpzlDAyEYdoumzh1G_Z1z-Z5sbLGhWRGuksGsasYXEYeuG16TDSs/exec';
/* ↑開発用URL */
var userDataList = [];

window.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('bal_searchInput'); // 検索欄
    const searchBtn = document.getElementById('bal_searchBtn'); // 検索ボタン
    const sortUserId = document.getElementById('bal_sortUserId'); // 銀行口座番号で並べ替えボタン
    const sortTimestamp = document.getElementById('bal_sortTimestamp'); // 口座登録日時で並べ替えボタン
    const reloadBtn = document.getElementById('bal_reloadBtn'); // 再読み込みボタン
    const topBtn = document.getElementById('bal_topBtn'); // トップへ戻るボタン

    // ローダーを生成
    createLoader('よみこみ<ruby>中<rt>ちゅう</rt></ruby>');
    // 全てのユーザーデータを取得
    getAllUsers();

    // 検索欄にフォーカス時の処理
    searchInput.addEventListener('focus', function () {
        const sujestList = document.getElementById('bal_seachSujestList');

        if (this.value) {
            sujestList.parentElement.classList.remove('bal_hideSearchSujest');
        }
    });

    // 検索欄に入力時の処理
    searchInput.addEventListener('input', function () {
        const sujestList = document.getElementById('bal_seachSujestList');
        sujestList.parentElement.classList.add('bal_hideSearchSujest');
        sujestList.innerHTML = '';

        const uniqueNames = Array.from(new Set(userDataList.map(user => user.userName))).sort();

        if (this.value) {
            for (let i = 0; i < uniqueNames.length; i++) {
                if (String(uniqueNames[i]).includes(this.value)) {
                    let li = document.createElement('li');

                    li.innerHTML = `
                        <a href="javascript:void(0);" tabIndex="0";>
                            <p>${uniqueNames[i]}</p>
                        </a>
                    `;

                    li.addEventListener('click', clickSujest);
                    sujestList.appendChild(li);
                    sujestList.parentElement.classList.remove('bal_hideSearchSujest');
                }
            }
        }

        function clickSujest() {
            const searchInput = document.getElementById('bal_searchInput');
            const sujestList = document.getElementById('bal_seachSujestList');

            searchInput.value = this.firstElementChild.innerText;
            sujestList.parentElement.classList.add('bal_hideSearchSujest');
        }
    });

    // 検索ボタン押下時の処理
    searchBtn.addEventListener('click', function () {
        showLoader();

        const userList = document.getElementById('bal_userList');
        const searchInput = document.getElementById('bal_searchInput');
        const sujestList = document.getElementById('bal_seachSujestList');
        const numOfUsersElm = document.getElementById('bal_numOfUsers');
        let numOfMatchUsers = 0;

        userList.innerHTML = '';

        for (let i = 0; i < userDataList.length; i++) {
            if (userDataList[i].userName.includes(searchInput.value)) {
                if (numOfMatchUsers < 50) {
                    appendUser(userDataList[i].userName, userDataList[i].userId, userDataList[i].birthday, userDataList[i].timestamp);
                }
                userDataList[i].searchFlg = true;
                numOfMatchUsers++;
            } else {
                userDataList[i].searchFlg = false;
            }
        }

        if (numOfMatchUsers >= 50) {
            numOfUsersElm.innerHTML = `
                50<ruby>件<rt>けん</rt></ruby><ruby>以上<rt>いじょう</rt></ruby>
            `;
        } else {
            numOfUsersElm.innerHTML = `
                ${numOfMatchUsers}<ruby>件<rt>けん</rt></ruby>
            `;
        }

        sujestList.parentElement.classList.add('bal_hideSearchSujest');

        hideLoader();
    });

    // 銀行口座番号で並べ替えボタン押下時の処理
    sortUserId.addEventListener('change', function () {
        showLoader();

        let numOfUsers = 0;

        if (this.checked) {
            userDataList.sort((a, b) => getUserId(a) - getUserId(b));
        } else {
            userDataList.sort((a, b) => getUserId(b) - getUserId(a));
        }

        function getUserId(user) {
            return parseInt(user.userId);
        }

        for (let i = 0; i < userDataList.length; i++) {
            if (userDataList[i].searchFlg) {
                if (numOfUsers < 50) {
                    setUser(userDataList[i].userName, userDataList[i].userId, userDataList[i].birthday, userDataList[i].timestamp);
                }

                numOfUsers++;
            }
        }

        hideLoader();
    });

    // 口座登録日時で並べ替えボタン押下時の処理
    sortTimestamp.addEventListener('change', function () {
        showLoader();

        let numOfUsers = 0;

        if (this.checked) {
            userDataList.sort((a, b) => getTimestamp(a) - getTimestamp(b));
        } else {
            userDataList.sort((a, b) => getTimestamp(b) - getTimestamp(a));
        }

        function getTimestamp(user) {
            return new Date(user.timestamp);
        }

        for (let i = 0; i < userDataList.length; i++) {
            if (userDataList[i].searchFlg) {
                if (numOfUsers < 50) {
                    setUser(userDataList[i].userName, userDataList[i].userId, userDataList[i].birthday, userDataList[i].timestamp);
                }

                numOfUsers++;
            }
        }

        hideLoader();
    });

    // 再読み込みボタン押下時の処理
    reloadBtn.addEventListener('click', function () {
        const searchInput = document.getElementById('bal_searchInput');
        const sujestList = document.getElementById('bal_seachSujestList');

        searchInput.value = '';
        sujestList.parentElement.classList.add('bal_hideSearchSujest');
        sujestList.innerHTML = '';

        getAllUsers();
    });

    // トップへ戻るボタン押下時の処理
    topBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// 全てユーザー情報を取得する関数
async function getAllUsers() {
    showLoader();

    const newUrl = setQueryParams(IDLIST_GAS_URL, { action: 'getAllUsers' });

    try {
        const response = await fetch(newUrl);
        const result = await response.json();

        if (result.message) {
            showError(result.message);
        } else {
            displayUserData(result.result);
        }
    } catch (e) {
        showError('ネットワークにせつぞくされているかかくにんしてください\n\n' + e);
    } finally {
        hideLoader();
    }
}

// ユーザー情報を表示する関数
function displayUserData(users) {
    const userList = document.getElementById('bal_userList');
    const numOfUsersElm = document.getElementById('bal_numOfUsers');
    let numOfUsers = 0;

    userList.innerHTML = '';
    userDataList = [];

    for (let i = 0; i < users.length; i++) {
        userDataList.push({
            userId: users[i].userId,
            userName: users[i].userName,
            timestamp: users[i].timestamp,
            birthday: users[i].birthday,
            searchFlg: true
        });

        if (numOfUsers < 50) {
            appendUser(users[i].userName, users[i].userId, users[i].birthday, users[i].timestamp);
        }

        numOfUsers++;
    }

    if (numOfUsers >= 50) {
        numOfUsersElm.innerHTML = `
            50<ruby>件<rt>けん</rt></ruby><ruby>以上<rt>いじょう</rt></ruby>
        `;
    } else {
        numOfUsersElm.innerHTML = `
            ${numOfUsers}<ruby>件<rt>けん</rt></ruby>
        `;
    }
}

function appendUser(userName, userId, birthday, timestamp) {
    const userList = document.getElementById('bal_userList');
    let li = document.createElement('li');
    li.innerHTML = `
        <div class="bal_userCard">
            <p class="bal_typo_userName bal_userName">${userName}</p>
            <div class="bal_userCardContents">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <svg width="48" height="48" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                    <g>
                                        <path d="M507.342,115.223c-4.474-10.571-11.884-19.57-21.424-26.028c-9.789-6.617-21.214-10.112-33.104-10.112H59.186 c-7.994,0-15.744,1.572-23.039,4.657c-10.582,4.478-19.581,11.884-26.032,21.428C3.495,114.972-0.003,126.418,0,138.273v235.454 c0,7.987,1.564,15.738,4.658,23.043c4.474,10.586,11.884,19.584,21.425,26.022c9.792,6.623,21.238,10.126,33.104,10.126h393.627 c7.976,0,15.726-1.572,23.039-4.658c10.578-4.471,19.581-11.891,26.028-21.436c6.624-9.788,10.122-21.234,10.119-33.097V138.273 C512,130.286,510.436,122.535,507.342,115.223z M483.632,373.727c0,4.155-0.814,8.188-2.418,11.985 c-2.332,5.518-6.196,10.211-11.18,13.57c-5.088,3.43-11.044,5.254-17.219,5.261H59.186c-4.158,0-8.191-0.811-11.995-2.418 c-5.508-2.325-10.198-6.193-13.567-11.181c-3.434-5.088-5.253-11.045-5.256-17.216V138.273c0-4.162,0.814-8.202,2.418-11.999 c2.325-5.504,6.19-10.197,11.18-13.57c5.092-3.43,11.044-5.246,17.219-5.246h393.627c4.162,0,8.199,0.811,11.991,2.404 c5.508,2.332,10.201,6.2,13.57,11.181c3.434,5.087,5.253,11.051,5.256,17.23V373.727z" fill="#008673"></path>
                                        <path d="M129.08,261.217c24.834,0,44.963-20.13,44.963-44.96c0-24.837-20.129-44.966-44.963-44.966 c-24.83,0-44.96,20.129-44.96,44.966C84.121,241.088,104.25,261.217,129.08,261.217z" fill="#008673"></path>
                                        <path d="M167.154,268.107c-0.976-0.976-5.411-1.22-6.613-0.488c-9.167,5.655-19.925,8.956-31.46,8.956 c-11.539,0-22.293-3.301-31.458-8.956c-1.209-0.732-5.637-0.488-6.616,0.488c-7.546,7.549-17.496,24.399-19.502,36.427 c-4.938,29.609,26.692,40.302,57.576,40.302c30.886,0,62.512-10.693,57.579-40.302 C184.654,292.506,174.707,275.656,167.154,268.107z" fill="#008673"></path>
                                        <rect x="233.244" y="180.584" width="202.124" height="22.49" fill="#008673"></rect>
                                        <rect x="233.244" y="244.087" width="202.124" height="22.497" fill="#008673"></rect>
                                        <rect x="233.244" y="307.598" width="125.392" height="22.49" fill="#008673"></rect>
                                    </g>
                                </svg>
                            </td>
                            <td>
                                <p class="bal_typo_userContentsTtl">銀行口座番号</p>
                            </td>
                            <td>
                                <p class="bal_typo_userContentsDetail bal_userId">${userId}</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_11_4)">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M34.6667 19.8C36.027 19.7999 37.336 20.2093 38.3258 20.9442C39.3156 21.6791 39.9113 22.6842 39.9911 23.7536L40 24V28.2C40 29.096 39.3262 29.7946 38.432 30.1138L38.2222 30.1796V35.2C38.2225 35.9064 37.8837 36.5868 37.2738 37.1048C36.6638 37.6227 35.8278 37.94 34.9333 37.993L34.6667 38H13.3333C12.4363 38.0002 11.5723 37.7334 10.9146 37.2531C10.2568 36.7728 9.85394 36.1144 9.78667 35.41L9.77778 35.2V30.181C9.29796 30.0492 8.8764 29.8115 8.56339 29.4963C8.25038 29.181 8.05913 28.8015 8.01244 28.403L8 28.2V24C7.99992 22.9287 8.51969 21.8979 9.45295 21.1184C10.3862 20.339 11.6624 19.8698 13.0204 19.807L13.3333 19.8H34.6667ZM34.5476 29.18C34.2718 29.017 33.9417 28.9207 33.5977 28.9028C33.2536 28.8849 32.9104 28.9462 32.6098 29.0792L32.4142 29.18L31.9413 29.46C31.069 29.9755 30.0168 30.268 28.9268 30.298C27.8368 30.3281 26.7613 30.0942 25.8453 29.628L25.5413 29.46L25.0667 29.18C24.7909 29.017 24.4609 28.9207 24.1168 28.9028C23.7727 28.8849 23.4295 28.9462 23.1289 29.0792L22.9333 29.18L22.4587 29.46C21.5865 29.9752 20.5347 30.2675 19.4451 30.2975C18.3554 30.3276 17.2803 30.0939 16.3644 29.628L16.0587 29.46L15.5858 29.18C15.31 29.017 14.98 28.9207 14.6359 28.9028C14.2919 28.8849 13.9486 28.9462 13.648 29.0792L13.4524 29.18L13.3333 29.25V35.2H34.6667V29.25L34.5476 29.18ZM34.6667 22.6H13.3333C12.8618 22.6 12.4097 22.7475 12.0763 23.0101C11.7429 23.2726 11.5556 23.6287 11.5556 24V26.807C12.4739 26.3239 13.5602 26.0772 14.6642 26.101C15.7683 26.1248 16.8357 26.418 17.7191 26.94L18.192 27.22C18.4997 27.4018 18.874 27.5 19.2587 27.5C19.6433 27.5 20.0176 27.4018 20.3253 27.22L20.8 26.94C21.7232 26.3947 22.846 26.1 24 26.1C25.154 26.1 26.2768 26.3947 27.2 26.94L27.6747 27.22C27.9824 27.4018 28.3567 27.5 28.7413 27.5C29.126 27.5 29.5003 27.4018 29.808 27.22L30.2809 26.94C31.1643 26.418 32.2317 26.1248 33.3358 26.101C34.4398 26.0772 35.5261 26.3239 36.4444 26.807V24C36.4444 23.6287 36.2571 23.2726 35.9237 23.0101C35.5903 22.7475 35.1382 22.6 34.6667 22.6ZM25.0667 10.28C25.8007 10.733 26.483 11.2356 27.1058 11.7822C28.0373 12.6068 29.3333 13.997 29.3333 15.6C29.3333 16.7139 28.7714 17.7822 27.7712 18.5698C26.771 19.3575 25.4145 19.8 24 19.8C22.5855 19.8 21.229 19.3575 20.2288 18.5698C19.2286 17.7822 18.6667 16.7139 18.6667 15.6C18.6667 13.997 19.9644 12.6068 20.8942 11.7822C21.517 11.2356 22.1993 10.733 22.9333 10.28C23.2411 10.0982 23.6153 10 24 10C24.3847 10 24.7589 10.0982 25.0667 10.28ZM24 13.2676C23.8452 13.389 23.6952 13.5141 23.5502 13.6428C22.704 14.3932 22.2222 15.103 22.2222 15.6C22.2222 15.9713 22.4095 16.3274 22.7429 16.5899C23.0763 16.8525 23.5285 17 24 17C24.4715 17 24.9237 16.8525 25.2571 16.5899C25.5905 16.3274 25.7778 15.9713 25.7778 15.6C25.7778 15.103 25.2978 14.3932 24.4498 13.6428C24.3048 13.5141 24.1548 13.389 24 13.2676Z" fill="#008673" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_11_4">
                                            <rect width="48" height="48" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </td>
                            <td>
                                <p class="bal_typo_userContentsTtl">たんじょう日</p>
                            </td>
                            <td>
                                <p class="bal_typo_userContentsDetail bal_birthday">${birthday}</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.0768 8C17.3738 8 17.6587 8.118 17.8688 8.32804C18.0788 8.53808 18.1968 8.82296 18.1968 9.12V11.2144H30.224V9.1344C30.224 8.83736 30.342 8.55248 30.552 8.34244C30.7621 8.1324 31.047 8.0144 31.344 8.0144C31.641 8.0144 31.9259 8.1324 32.136 8.34244C32.346 8.55248 32.464 8.83736 32.464 9.1344V11.2144H36.8C37.6484 11.2144 38.4621 11.5513 39.0622 12.1511C39.6622 12.7509 39.9996 13.5644 40 14.4128V36.8016C39.9996 37.65 39.6622 38.4635 39.0622 39.0633C38.4621 39.6631 37.6484 40 36.8 40H11.2C10.3516 40 9.53789 39.6631 8.93782 39.0633C8.33775 38.4635 8.00042 37.65 8 36.8016V14.4128C8.00042 13.5644 8.33775 12.7509 8.93782 12.1511C9.53789 11.5513 10.3516 11.2144 11.2 11.2144H15.9568V9.1184C15.9572 8.82163 16.0754 8.53717 16.2854 8.32747C16.4954 8.11778 16.78 8 17.0768 8ZM10.24 20.3872V36.8016C10.24 36.9277 10.2648 37.0525 10.3131 37.169C10.3613 37.2854 10.432 37.3913 10.5212 37.4804C10.6103 37.5696 10.7162 37.6403 10.8326 37.6885C10.9491 37.7368 11.0739 37.7616 11.2 37.7616H36.8C36.9261 37.7616 37.0509 37.7368 37.1674 37.6885C37.2839 37.6403 37.3897 37.5696 37.4788 37.4804C37.568 37.3913 37.6387 37.2854 37.6869 37.169C37.7352 37.0525 37.76 36.9277 37.76 36.8016V20.4096L10.24 20.3872ZM18.6672 31.3904V34.056H16V31.3904H18.6672ZM25.3328 31.3904V34.056H22.6672V31.3904H25.3328ZM32 31.3904V34.056H29.3328V31.3904H32ZM18.6672 25.0272V27.6928H16V25.0272H18.6672ZM25.3328 25.0272V27.6928H22.6672V25.0272H25.3328ZM32 25.0272V27.6928H29.3328V25.0272H32ZM15.9568 13.4528H11.2C11.0739 13.4528 10.9491 13.4776 10.8326 13.5259C10.7162 13.5741 10.6103 13.6448 10.5212 13.734C10.432 13.8231 10.3613 13.929 10.3131 14.0454C10.2648 14.1619 10.24 14.2867 10.24 14.4128V18.1488L37.76 18.1712V14.4128C37.76 14.2867 37.7352 14.1619 37.6869 14.0454C37.6387 13.929 37.568 13.8231 37.4788 13.734C37.3897 13.6448 37.2839 13.5741 37.1674 13.5259C37.0509 13.4776 36.9261 13.4528 36.8 13.4528H32.464V14.9392C32.464 15.2362 32.346 15.5211 32.136 15.7312C31.9259 15.9412 31.641 16.0592 31.344 16.0592C31.047 16.0592 30.7621 15.9412 30.552 15.7312C30.342 15.5211 30.224 15.2362 30.224 14.9392V13.4528H18.1968V14.9248C18.1968 15.2218 18.0788 15.5067 17.8688 15.7168C17.6587 15.9268 17.3738 16.0448 17.0768 16.0448C16.7798 16.0448 16.4949 15.9268 16.2848 15.7168C16.0748 15.5067 15.9568 15.2218 15.9568 14.9248V13.4528Z" fill="#008673" />
                                </svg>
                            </td>
                            <td>
                                <p class="bal_typo_userContentsTtl">口座登録日時</p>
                            </td>
                            <td>
                                <p class="bal_typo_userContentsDetail bal_timestamp">${formatDate(new Date(timestamp))}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    userList.appendChild(li);
}

function setUser(userName, userId, birthday, timestamp) {
    const userList = document.getElementById('bal_userList');

    for (let i = 0; i < userList.children.length; i++) {
        userList.children.item(i).getElementsByClassName('bal_userName')[0].innerText = userName;
        userList.children.item(i).getElementsByClassName('bal_userId')[0].innerText = userId;
        userList.children.item(i).getElementsByClassName('bal_birthday')[0].innerText = birthday;
        userList.children.item(i).getElementsByClassName('bal_timestamp')[0].innerText = timestamp;
    }
}

// 日付をフォーマットする関数
function formatDate(date) {
    // 出力文字列を初期化
    let output = '';

    // 年、月、日、時、分、秒を取得
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // 出力文字列を組み立て
    output = year + '/' + month + '/' + day + ' ' + hours + ':' + minutes;

    // フォーマット済みの日付文字列を返す
    return output;
}

// エラーを表示する関数
function showError(message) {
    const userList = document.getElementById('bal_userList');
    const li = document.createElement('li');
    const p = document.createElement('p');
    p.classList.add('bal_typo_error');
    p.innerText = message;
    li.appendChild(p);
    userList.appendChild(li);
}