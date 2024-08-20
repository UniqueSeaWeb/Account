/** アカウント一覧 **/
/* ID一覧スプレッドシート：https://docs.google.com/spreadsheets/d/17_Nby4CksFtpc-d_4MTuZrHrBsBp_JqBKpbJwZvNynI/edit?gid=0#gid=0 */
// ID一覧スプレッドシートのGASのウェブアプリURL
const IDLIST_GAS_URL = 'https://script.google.com/macros/s/AKfycbyjYdFnxx5UZ0TEmpzlDAyEYdoumzh1G_Z1z-Z5sbLGhWRGuksGsasYXEYeuG16TDSs/exec';
var userDataList = [];

window.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('bal_searchInput'); // 検索欄
    const searchBtn = document.getElementById('bal_searchBtn'); // 検索ボタン
    const sortUserName = document.getElementById('bal_sortUserName'); // なまえでならべかえリンク
    const reloadBtn = document.getElementById('bal_reloadBtn'); // 再読み込みボタン

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

    // 検索欄Enter時の処理
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            // 検索ボタンをクリック
            const searchBtn = document.getElementById('bal_searchBtn');
            searchBtn.click();
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
                    appendUser(userDataList[i].userName, userDataList[i].userId, userDataList[i].timestamp);
                }
                userDataList[i].searchFlg = true;
                numOfMatchUsers++;
            } else {
                userDataList[i].searchFlg = false;
            }
        }

        numOfUsersElm.innerText = numOfMatchUsers;
        sujestList.parentElement.classList.add('bal_hideSearchSujest');

        hideLoader();
    });

    // なまえでならべかえリンク押下時の処理
    sortUserName.addEventListener('change', function () {
        showLoader();

        const userList = document.getElementById('bal_userList');
        let numOfUsers = 0;

        if (this.checked) {
            userDataList.sort((a, b) => {
                // userNameを比較する
                if (a.userName < b.userName) {
                    return -1; // aを前に
                } else if (a.userName > b.userName) {
                    return 1; // bを前に
                } else {
                    return 0; // 同じ
                }
            });
        } else {
            userDataList.sort((a, b) => {
                // userNameを比較する
                if (a.userName > b.userName) {
                    return -1; // aを前に
                } else if (a.userName < b.userName) {
                    return 1; // bを前に
                } else {
                    return 0; // 同じ
                }
            });
        }

        for (let i = 0; i < userDataList.length; i++) {
            if (userDataList[i].searchFlg) {
                userList.children.item(numOfUsers).getElementsByClassName('bal_userName')[0].innerText = userDataList[i].userName;
                userList.children.item(numOfUsers).getElementsByClassName('bal_userId')[0].innerText = userDataList[i].userId;
                userList.children.item(numOfUsers).getElementsByClassName('bal_timestamp')[0].innerText = userDataList[i].timestamp;

                numOfUsers++;
            }

            if (numOfUsers == userList.length) {
                break;
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
        showError(`つうしんエラーがはっせいしました。\nインターネットにつながっているかかくにんしてください\n\n${e.message}\n>Didn't get user data`);
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
            searchFlg: true
        });

        appendUser(users[i].userName, users[i].userId, users[i].timestamp);

        numOfUsers++;
    }

    numOfUsersElm.innerText = numOfUsers;
}

function appendUser(userName, userId, timestamp) {
    const userList = document.getElementById('bal_userList');
    let li = document.createElement('li');
    // li.innerHTML = `
    //     <div class="bal_userCard">
    //         <p class="bal_typo_userName bal_userName">${userName}</p>
    //         <div class="bal_userCardContents">
    //             <table>
    //                 <tbody>
    //                     <tr>
    //                         <td>
    //                             <svg width="48" height="48" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    //                                 <g>
    //                                     <path d="M507.342,115.223c-4.474-10.571-11.884-19.57-21.424-26.028c-9.789-6.617-21.214-10.112-33.104-10.112H59.186 c-7.994,0-15.744,1.572-23.039,4.657c-10.582,4.478-19.581,11.884-26.032,21.428C3.495,114.972-0.003,126.418,0,138.273v235.454 c0,7.987,1.564,15.738,4.658,23.043c4.474,10.586,11.884,19.584,21.425,26.022c9.792,6.623,21.238,10.126,33.104,10.126h393.627 c7.976,0,15.726-1.572,23.039-4.658c10.578-4.471,19.581-11.891,26.028-21.436c6.624-9.788,10.122-21.234,10.119-33.097V138.273 C512,130.286,510.436,122.535,507.342,115.223z M483.632,373.727c0,4.155-0.814,8.188-2.418,11.985 c-2.332,5.518-6.196,10.211-11.18,13.57c-5.088,3.43-11.044,5.254-17.219,5.261H59.186c-4.158,0-8.191-0.811-11.995-2.418 c-5.508-2.325-10.198-6.193-13.567-11.181c-3.434-5.088-5.253-11.045-5.256-17.216V138.273c0-4.162,0.814-8.202,2.418-11.999 c2.325-5.504,6.19-10.197,11.18-13.57c5.092-3.43,11.044-5.246,17.219-5.246h393.627c4.162,0,8.199,0.811,11.991,2.404 c5.508,2.332,10.201,6.2,13.57,11.181c3.434,5.087,5.253,11.051,5.256,17.23V373.727z" fill="#008673"></path>
    //                                     <path d="M129.08,261.217c24.834,0,44.963-20.13,44.963-44.96c0-24.837-20.129-44.966-44.963-44.966 c-24.83,0-44.96,20.129-44.96,44.966C84.121,241.088,104.25,261.217,129.08,261.217z" fill="#008673"></path>
    //                                     <path d="M167.154,268.107c-0.976-0.976-5.411-1.22-6.613-0.488c-9.167,5.655-19.925,8.956-31.46,8.956 c-11.539,0-22.293-3.301-31.458-8.956c-1.209-0.732-5.637-0.488-6.616,0.488c-7.546,7.549-17.496,24.399-19.502,36.427 c-4.938,29.609,26.692,40.302,57.576,40.302c30.886,0,62.512-10.693,57.579-40.302 C184.654,292.506,174.707,275.656,167.154,268.107z" fill="#008673"></path>
    //                                     <rect x="233.244" y="180.584" width="202.124" height="22.49" fill="#008673"></rect>
    //                                     <rect x="233.244" y="244.087" width="202.124" height="22.497" fill="#008673"></rect>
    //                                     <rect x="233.244" y="307.598" width="125.392" height="22.49" fill="#008673"></rect>
    //                                 </g>
    //                             </svg>
    //                         </td>
    //                         <td>
    //                             <p class="bal_typo_userContentsTtl">銀行口座番号</p>
    //                         </td>
    //                         <td>
    //                             <p class="bal_typo_userContentsDetail bal_userId">${userId}</p>
    //                         </td>
    //                     </tr>
    //                     <tr>
    //                         <td>
    //                             <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    //                                 <path d="M17.0768 8C17.3738 8 17.6587 8.118 17.8688 8.32804C18.0788 8.53808 18.1968 8.82296 18.1968 9.12V11.2144H30.224V9.1344C30.224 8.83736 30.342 8.55248 30.552 8.34244C30.7621 8.1324 31.047 8.0144 31.344 8.0144C31.641 8.0144 31.9259 8.1324 32.136 8.34244C32.346 8.55248 32.464 8.83736 32.464 9.1344V11.2144H36.8C37.6484 11.2144 38.4621 11.5513 39.0622 12.1511C39.6622 12.7509 39.9996 13.5644 40 14.4128V36.8016C39.9996 37.65 39.6622 38.4635 39.0622 39.0633C38.4621 39.6631 37.6484 40 36.8 40H11.2C10.3516 40 9.53789 39.6631 8.93782 39.0633C8.33775 38.4635 8.00042 37.65 8 36.8016V14.4128C8.00042 13.5644 8.33775 12.7509 8.93782 12.1511C9.53789 11.5513 10.3516 11.2144 11.2 11.2144H15.9568V9.1184C15.9572 8.82163 16.0754 8.53717 16.2854 8.32747C16.4954 8.11778 16.78 8 17.0768 8ZM10.24 20.3872V36.8016C10.24 36.9277 10.2648 37.0525 10.3131 37.169C10.3613 37.2854 10.432 37.3913 10.5212 37.4804C10.6103 37.5696 10.7162 37.6403 10.8326 37.6885C10.9491 37.7368 11.0739 37.7616 11.2 37.7616H36.8C36.9261 37.7616 37.0509 37.7368 37.1674 37.6885C37.2839 37.6403 37.3897 37.5696 37.4788 37.4804C37.568 37.3913 37.6387 37.2854 37.6869 37.169C37.7352 37.0525 37.76 36.9277 37.76 36.8016V20.4096L10.24 20.3872ZM18.6672 31.3904V34.056H16V31.3904H18.6672ZM25.3328 31.3904V34.056H22.6672V31.3904H25.3328ZM32 31.3904V34.056H29.3328V31.3904H32ZM18.6672 25.0272V27.6928H16V25.0272H18.6672ZM25.3328 25.0272V27.6928H22.6672V25.0272H25.3328ZM32 25.0272V27.6928H29.3328V25.0272H32ZM15.9568 13.4528H11.2C11.0739 13.4528 10.9491 13.4776 10.8326 13.5259C10.7162 13.5741 10.6103 13.6448 10.5212 13.734C10.432 13.8231 10.3613 13.929 10.3131 14.0454C10.2648 14.1619 10.24 14.2867 10.24 14.4128V18.1488L37.76 18.1712V14.4128C37.76 14.2867 37.7352 14.1619 37.6869 14.0454C37.6387 13.929 37.568 13.8231 37.4788 13.734C37.3897 13.6448 37.2839 13.5741 37.1674 13.5259C37.0509 13.4776 36.9261 13.4528 36.8 13.4528H32.464V14.9392C32.464 15.2362 32.346 15.5211 32.136 15.7312C31.9259 15.9412 31.641 16.0592 31.344 16.0592C31.047 16.0592 30.7621 15.9412 30.552 15.7312C30.342 15.5211 30.224 15.2362 30.224 14.9392V13.4528H18.1968V14.9248C18.1968 15.2218 18.0788 15.5067 17.8688 15.7168C17.6587 15.9268 17.3738 16.0448 17.0768 16.0448C16.7798 16.0448 16.4949 15.9268 16.2848 15.7168C16.0748 15.5067 15.9568 15.2218 15.9568 14.9248V13.4528Z" fill="#008673" />
    //                             </svg>
    //                         </td>
    //                         <td>
    //                             <p class="bal_typo_userContentsTtl">口座登録日時</p>
    //                         </td>
    //                         <td>
    //                             <p class="bal_typo_userContentsDetail bal_timestamp">${formatDate(new Date(timestamp))}</p>
    //                         </td>
    //                     </tr>
    //                 </tbody>
    //             </table>
    //         </div>
    //     </div>
    // `;
    li.innerHTML = `
        <div class="bal_userCard">
            <img src="../account_files/p_image/person.svg">
            <div class="bal_userTableWrapper">
                <table class="bal_userTable">
                    <tbody>
                        <tr>
                            <th>
                                <p>ID</p>
                            </th>
                            <td>
                                <p class="bal_userId">${userId}</p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <p>なまえ</p>
                            </th>
                            <td>
                                <p class="bal_userName">${userName}</p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <p>タイムスタンプ</p>
                            </th>
                            <td>
                                <p class="bal_timestamp">${timestamp}</p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <p>誕生日の日にち</p>
                            </th>
                            <td>
                                <p class="bal_birthday">----/--/-- --:--</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    userList.appendChild(li);
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
    userList.innerHTML = '';
    userList.appendChild(li);
}