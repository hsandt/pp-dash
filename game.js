/*
 * Pinpon dash.JS
 * Global Game Jum 2015 in Tokyo chika-ba
 */

Pinpon_dash = {}; // ピンポンダッシュオブジェクト
Pinpon_dash.fase = {}; // 行動フェーズに関するオブジェクト
Pinpon_dash.timer = {}; // ゲームのタイマー関連オブジェクト
Pinpon_dash.audio = {}; // オーディオオブジェクト
Pinpon_dash.userData = {}; // ユーザーの操作によって扱われるデータ


// 1ループの秒数。これが徐々に減っていく
Pinpon_dash.timer.loop_of_msec = 2000;
// 現在の経過秒数
Pinpon_dash.timer.now_msec = 0;
// 繰り返した回数(スコア)
Pinpon_dash.userData.score = 0;
// ノックするターンとドアを開くターンを切り替える。正の数の時はノック、負の数の時はオープン
Pinpon_dash.fase.knock_or_open_flag = 1;
// タイマーの間隔。値を少なくするとフレームレイトが上昇
Pinpon_dash.timer.default_timer_wait = 10;


// 初期化
Pinpon_dash.init = function() {
	// ユーザーがノックした時間
	this.userData.knocked_times = new Array();
	// ユーザーがオープンした時間
	this.userData.opened_times = new Array();

	// loading sounds.
	Pinpon_dash.load_sounds();

	// reference sprites
	this.character1 = document.getElementById('player1-icon-area');
}

// スタート処理
Pinpon_dash.start = function() {
	// スタートボタンを無効にする
	document.getElementById("game-start-button").disabled = true;
	// 開始前の合図
	this.first_starting_process();
}

// ゲーム開始1。チャイム音を鳴らす
Pinpon_dash.first_starting_process = function() {
	// 待機サウンドを停止
	this.audio.start_wait.pause();
	// チャイム音を鳴らす
	this.audio.startSE.play();
	setTimeout("Pinpon_dash.second_starting_process(0);", this.timer.loop_of_msec);
}

// ゲーム開始2。ボイスを鳴らす
Pinpon_dash.second_starting_process = function(voice_num) {
	// ボイスを鳴らす
	this.audio.voices[voice_num].play();
	if(voice_num < 3) { // 最初の3回はボイスだけ変えて繰り返す
		setTimeout("Pinpon_dash.second_starting_process(" + (voice_num + 1) + ");", this.timer.loop_of_msec / 4);
	} else { // 4回目は次のステップへ
		setTimeout("Pinpon_dash.thard_starting_process();", this.timer.loop_of_msec / 4);
		document.getElementById("user-action-button").disabled = false;
		document.getElementById("user-action-button").focus(0);
	} // 4回目以降かどうか？
}

// ゲーム開始3。ノックフェーズ開始
Pinpon_dash.thard_starting_process = function() {
	// ノックボタンを有効にし、フォーカスを移す
	// Plai music
	this.audio.bgm.play();
	this.userData.knocked_times = new Array();

	// timer start
	this.timer.intervalID = setInterval("Pinpon_dash.process_of_fase();", this.timer.default_timer_wait);
}


// 音声をロード
Pinpon_dash.load_sounds = function() {
	// 待機中に流す音楽
	this.audio.start_wait = new Audio("bgm/bgm_startWait.mp3");
	this.audio.start_wait.loop = true;
	this.audio.start_wait.play();

	// ゲーム開始時に鳴らす効果音
	this.audio.startSE = new Audio("wav/startSE.mp3");
	this.audio.voices = [
		new Audio("wav/voice1.mp3"),
		new Audio("wav/voice2.mp3"),
		new Audio("wav/voice3.mp3"),
		new Audio("wav/voice4.mp3"),
	];

	// メインのBGM
	this.audio.bgm = new Audio("bgm/bgm_bpm120.mp3");

	// 各種効果音
	this.audio.change_fase = new Audio("wav/change_fase.mp3"); // フェーズ変更時の音(デバッグ用)
	this.audio.knock = [ // ドアノック音
		new Audio("wav/knock1.mp3"),
		new Audio("wav/knock2.mp3"),
	]; //ドアノック音
	this.audio.open = [ // ドアオープン音
		new Audio("wav/doorOpen1.mp3"),
		new Audio("wav/doorOpen2.mp3")
	] // ドアオープン音
}

// プレイヤーの行動フェーズを進める
Pinpon_dash.process_of_fase = function() {
	this.timer.now_msec += this.timer.default_timer_wait;
	if(this.timer.loop_of_msec < this.timer.now_msec) { // ループ秒に達したら？
		this.change_fase(); // フェーズ変更
	} // end if msec end.

	// プレイヤーが立つ位置を設定
	this.set_player_position();
	// VIEW Character
	Pinpon_dash.render()
}

// 時刻情報から扉の番号を返す(1-16)
Pinpon_dash.getDoorNumber_from_nowTime = function() {
	var ret = Math.floor(this.timer.now_msec / (this.timer.loop_of_msec / 16.0) + 1);
	if(ret > 16) ret = 16;
	return(ret);
}

// プレイヤーの位置を、扉画像の位置に調整する
Pinpon_dash.set_player_position = function() {
	var img = document.getElementById("door" + this.getDoorNumber_from_nowTime());
	this.character1.style.cssText = "top:" + img.offsetParent.offsetTop + "px; left:" + (img.offsetParent.offsetLeft - 5) + "px; position: absolute;";
}

// アクションするフェーズの変更
Pinpon_dash.change_fase = function() {
	// 切り替わったことを音で鳴らしている(デバッグ用)
	this.audio.change_fase.play();

	if(this.fase.knock_or_open_flag == 1) { // ノックフェーズからオープンフェーズへ移行
		this.change_knock_to_open_fase();
	} else { // オープンフェーズからノックフェーズへ移行
		this.change_open_to_knock_fase();
	} // フェーズ変更

	// ループ用の時刻情報を初期化して、次フェーズへ移せるようにする
	Pinpon_dash.timer.now_msec = 0; // 初期化
	// ノック、オープンのフラグを切り替え
	this.fase.knock_or_open_flag *= -1;
}

// ユーザーがボタンを押したことで呼ばれる関数
Pinpon_dash.on_click = function() {
	if(this.fase.knock_or_open_flag == 1) { // ノックする
		this.knock_door();
	} else { // ドアを開ける
		this.open_door();
	} // ノックするかドアを開けるか？
}

// 音声のリスタート
Pinpon_dash.audio.replay = function(audio_object) {
	audio_object.pause();
	audio_object.currentTime = 0;
	audio_object.play();
}

// ドアをノックする処理
Pinpon_dash.knock_door = function() {
	// 現在のノック時刻を格納
	this.userData.knocked_times.push(Pinpon_dash.timer.now_msec);
	// ドアをノックしたエフェクト
	this.effect_knock_door();
}

// ドアをノックした時のエフェクト
Pinpon_dash.effect_knock_door = function() {
	// ノックした音を再生
	this.audio.replay(this.audio.knock[Math.round(Math.random())]);
}

// ドアを開ける処理
Pinpon_dash.open_door = function() {
	// 現在のノック時刻を格納
	this.userData.opened_times.push(this.timer.now_msec);
	// 開けるドアを取得して、画像リソースを差し替える
	var img = document.getElementById("door" + this.getDoorNumber_from_nowTime());
	img.src = "img/opened_door.png";

	// ノックした時刻をチェック
	for(var i = 0; i < this.userData.knocked_times.length; i ++) {
		// ノックとのタイミングを比較して、前後の扉との時間内に収まっていればOK。
		if(Math.abs(this.userData.knocked_times[i] - this.timer.now_msec) < (this.timer.loop_of_msec / 16)) { // ノックしたドアなのでOK
			this.effect_open_knocked_door(); // 正しいタイミングでドアが開く
			return; // ドアが開いたのでここで処理終了
		} // 正しいドアが開けたか？
	} // end for.

	// ノックしていないドアを開いたので雷おじさん降臨
	this.effect_open_non_knocked_door();
}

// ドアを開ける時のエフェクト
Pinpon_dash.effect_open_knocked_door = function() {
	// ドアを開いた音を再生
	this.audio.replay(this.audio.open[Math.round(Math.random())]);
}

// ノックしていないドアを開ける時のエフェクト
Pinpon_dash.effect_open_non_knocked_door = function() {
	// 音楽を止める
	this.audio.bgm.pause();
	// ドアを開いた音を再生
	this.audio.replay(this.audio.open[Math.round(Math.random())]);
	// ゲームオーバーが確定したのでタイマー処理を中断
	clearInterval(this.timer.intervalID);
	// ドアが開いた音が終わるのを待ってから、ゲームオーバーページへ移動
	setTimeout('window.location.href = "./gameover1.htm"', 800);
}

// ノックフェーズからオープンフェーズへの移行
Pinpon_dash.change_knock_to_open_fase = function() {
	// 「ノック」ボタンを「ドアを開ける」ボタンに書き換える
	document.getElementById("user-action-button").value = "[あける]";
}

// オープンフェーズからノックフェーズへの移行
Pinpon_dash.change_open_to_knock_fase = function() {
	this.check_is_non_open_door(); // 未開封のドアのチェック

	// 押したノック、オープンボタンの情報を初期化
	this.userData.knocked_times = new Array();
	this.userData.opened_times = new Array();

	// 開いたドアを閉める
	var imgs = document.getElementsByClassName("door");
	for(var i = 0; i < imgs.length; i ++) {
		imgs[i].src = "img/closed_door.png";
	} // end for.
	document.getElementById("user-action-button").value = "[ノック]";

	// 1小説経過したのでスコアを増やす
	this.userData.score ++;
	// 4小説経過毎にレベルアップ
	if(this.userData.score % 4 == 0) this.level_up();
}

// ゲームのレベルがアップ
Pinpon_dash.level_up = function() {
	var bpm = Math.round(this.userData.score * 1.25) + 120;
//	this.audio.bgm.pause();
//	this.audio.bgm.currentTime = 0;
	this.audio.bgm = new Audio("bgm/bgm_bpm" + bpm + ".mp3");
	this.loop_of_msec = 120 * 2000 / bpm;
	this.audio.bgm.play();
}

// 未開放のドアのチェック
Pinpon_dash.check_is_non_open_door = function() {
	for(var i = 0; i < this.userData.knocked_times.length; i ++) {
		// 開け忘れのドア
		if(!(this.userData.opened_times[i]) || Math.abs(this.userData.knocked_times[i] - this.userData.opened_times[i]) > (this.timer.loop_of_msec / 16)) {
			this.effect_unopen_door(i); // 開いてないドアの処理
		}
	} // end for.
}

// 開いていないドアがあった時のエフェクト
Pinpon_dash.effect_unopen_door = function() {
	Pinpon_dash.audio.bgm.pause();
	window.location.href = "./gameover2.htm";
}

// render game view
Pinpon_dash.render = function() {
	this.character1.style.visibility = "visible";
	
	// debug.log(Pinpon_dash.timer.now_msec)
	// this.character1.style.left = "158px";
	// this.character1.style.top = "20px";
}

window.onload = function() {
	Pinpon_dash.init();
}