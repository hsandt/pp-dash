/***************************************
 * Pinpon dash.JS
 * Global Game Jum 2015 in Tokyo chika-ba
 *//////////////////////////////////////


Pinpon_dash = {}; // ピンポンダッシュオブジェクト
Pinpon_dash.audio = {}; // オーディオオブジェクト
// 1ループの秒数。これが徐々に減っていく
Pinpon_dash.loop_of_msec = 2000;
// 現在の経過秒数
Pinpon_dash.now_msec = 0;
// ノックするターンとドアを開くターンを切り替える。正の数の時はノック、負の数の時はオープン
Pinpon_dash.knock_or_open_flag = 1;
// タイマーの間隔。値を少なくするとフレームレイトが上昇
Pinpon_dash.default_timer_wait = 50;
// ユーザーがノックした時間
Pinpon_dash.user_knock_pushed = new Array();
// ユーザーがオープンした時間
Pinpon_dash.user_open_pushed = new Array();

// 初期化
Pinpon_dash.init = function() {
	// timer sta\rt.
	Pinpon_dash.load_sounds();
	Pinpon_dash.audio.bgm.loop;
//	Pinpon_dash.audio.bgm.play();

	// reference sprites
	Pinpon_dash.character1 = document.getElementById('character1');

	setInterval("Pinpon_dash.timer();", Pinpon_dash.default_timer_wait);
}

// 音声を
Pinpon_dash.load_sounds = function() {
	Pinpon_dash.audio.bgm = new Audio("bgm/bgm_bpm120.mp3");
	Pinpon_dash.audio.change_fase = new Audio("wav/change_fase.mp3");
	Pinpon_dash.audio.knock = new Audio("wav/knock.mp3");
	Pinpon_dash.audio.open = new Audio("wav/open.mp3");
	Pinpon_dash.audio.missed_unknocked_door = new Audio("wav/missed_unknocked_door.mp3");
	Pinpon_dash.audio.missed_non_open = new Audio("wav/missed_non_open.np3");
}

// 初期化した時に呼ばれるタイマー処理
Pinpon_dash.timer = function() {
	Pinpon_dash.now_msec += Pinpon_dash.default_timer_wait;
	if(Pinpon_dash.loop_of_msec < Pinpon_dash.now_msec) { // ループ秒に達したら？
		Pinpon_dash.change_fase(); // フェーズ変更
	} // end if msec end.

	// VIEW
	Pinpon_dash.render()
}

// フェーズ変更
Pinpon_dash.change_fase = function() {
	Pinpon_dash.audio.change_fase.play();
	Pinpon_dash.check_is_non_open_door(); // 未開封のドアのチェック
	Pinpon_dash.now_msec = 0; // 初期化
	Pinpon_dash.knock_or_open_flag *= -1; // ノック、オープンのフラグを切り替え
}

// ユーザーがボタンを押したことで呼ばれる関数
Pinpon_dash.ui_main = function() {
	if(Pinpon_dash.knock_or_open_flag == 1) { // ノックする
		Pinpon_dash.door_is_knock();
	} else { // ドアを開ける
		Pinpon_dash.door_is_open();
	} // ノックするかドアを開けるか？
}

// ドアをノックする処理
Pinpon_dash.door_is_knock = function() {
	// 現在のノック時刻を格納
	Pinpon_dash.user_knock_pushed.push(Pinpon_dash.now_msec);
	Pinpon_dash.effect_door_knock();
}

// ドアをノックした時のエフェクト
Pinpon_dash.effect_door_knock = function() {
	Pinpon_dash.audio.knock.play();
}

// ドアを開ける処理
Pinpon_dash.door_is_open = function() {
	// 現在のノック時刻を格納
	Pinpon_dash.user_open_pushed.push(Pinpon_dash.now_msec);

	// ノックした時刻をチェック
	for(var i = 0; i < Pinpon_dash.user_knock_pushed.length; i ++) {
		// ノックとのタイミングを比較して、50msec以内に入っていたらOK
		if(Math.abs(Pinpon_dash.user_knock_pushed[i] - Pinpon_dash.now_msec) < 50) { // ノックしたドアなのでOK
			Pinpon_dash.effect_knocked_door_open(); // 正しいタイミングでドアが開く
			return;
		} // 正しいドアがノックできたか？
	} // end for.

	// 正しいドアがノックできなかったので雷おじさん降臨
	Pinpon_dash.effect_non_knocked_door_open(); // ノックしてないドアが開く
}

// ドアを開ける時のエフェクト
Pinpon_dash.effect_door_open = function() {
	Pinpon_dash.audio.open.play();
}

// ノックしていないドアを開ける時のエフェクト
Pinpon_dash.effect_non_knocked_door_open = function() {
	Pinpon_dash.audio.bgm.pause();
	Pinpon_dash.audio.open.play();
	Pinpon_dash.audio.missed_unknocked_door.play();
}

// 未開放のドアのチェック
Pinpon_dash.check_is_non_open_door = function() {
	for(var i = 0; i < Pinpon_dash.user_knock_pushed.length; i ++) {
		// 開け忘れのドア
		if(!(Pinpon_dash.user_open_pushed[i]) || (Pinpon_dash.user_knock_pushed[i] - Pinpon_dash.user_open_pushed[i]).abs > 100) {
			Pinpon_dash.effect_unopen_door(i); // 開いてないドアの処理
		}
	} // end for.
	// 押したボタンの情報を初期化
	Pinpon_dash.user_knock_pushed = new Array();
	Pinpon_dash.user_open_pushed = new Array();
}

// 開いていないドアがあった時のエフェクト
Pinpon_dash.effect_unopen_door = function() {
	Pinpon_dash.audio.bgm.pause();
	Pinpon_dash.audio.missed_non_open.play();
}

window.onload = function() {
	Pinpon_dash.init();
}

// render game view
Pinpon_dash.render = function() {
	this.character1.style.visibility = "visible";
	this.character1.style.left = this.now_msec + "px";
	// debug.log(Pinpon_dash.now_msec)
	// character1.style.left = "58px";
	character1.style.top = "20px";
}