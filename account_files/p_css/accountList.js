/** アカウント一覧 **/
/* ID一覧スプレッドシート：https://docs.google.com/spreadsheets/d/17_Nby4CksFtpc-d_4MTuZrHrBsBp_JqBKpbJwZvNynI/edit?gid=0#gid=0 */
// ID一覧スプレッドシートのGASのウェブアプリURL
const IDLIST_GAS_URL = 'https://script.google.com/macros/s/AKfycbwRQpYsz47UnhpZlz5Kcnnsgtph5RCH63pcBJyUllQbmpTIeIGv54veQfJncZOtz6d2/exec';
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

        // 最大10人表示
        if (i < 10) {
            appendUser(users[i].userId, users[i].userName, users[i].timestamp, users[i].birthday);
        }
    }

    numOfUsersElm.innerText = users.length;
}

function appendUser(userId, userName, timestamp, birthday) {
    const userList = document.getElementById('bal_userList');
    let li = document.createElement('li');
    li.innerHTML = `
        <div class="bal_userCard">
            <div class="bal_userCardTop">
                <img src="../account_files/p_image/person.svg?20240801">
                <div class="bal_userCardTtl">
                    <p class="bal_userName">${userName}</p>
                </div>
            </div>
            <div class="bal_userCardBottom">
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
                                <p>とうろくにちじ</p>
                            </th>
                            <td>
                                <p class="bal_timestamp">${timestamp}</p>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <p>たんじょうびのひにち</p>
                            </th>
                            <td>
                                <p class="bal_birthday">${birthday}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    userList.appendChild(li);
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