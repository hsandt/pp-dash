# P.P. Dash

This game was made as part of the Global Game Jam 2015 at chika-ba, Japan ([see entry](https://globalgamejam.org/2015/games/p-p-dash)), and is only available in Japanese. If you cannot read it, you can still follow the instructions below to play.

To play, either download a copy of the repository and run `index.html`, or go to the [itch.io page](https://hsandt.itch.io/pp-dash).

The branch `ggj2015` keeps the source of the game as it was released for the game jam.

## Rules

P.P. Dash is a rhythm game for 2 players controlling 2 kids playing Ring and run at the *Knock Hotel*. During a round, player A sets a rhythm by knocking on certain doors in a row, then player B must repeat the pattern by opening the same doors, a la *Simon Says*.

If player B opens all the doors knocked by player A, the game continue to the next round. Otherwise (if player B missed a knocked door), the game ends. Note that player B may open doors that were not knocked without losing.
It is possible to see the game either as cooperative or competitive:

* Cooperative mode: player A knows as many doors as he/she wants, but must count on player B to repeat the pattern. The final score is the number of doors correctly knocked, then opened, minus the number of doors not knocked but opened (penalty). You can set a minimum and maximum number of doors to knock each round for extra difficulty and to prevent knock spamming, but the game itself doesn't enforce that.

* Competitive mode (rotation): player 1 starts as player A, and player 2 as player B. Player B must repeat the patterns of player A as many rounds as possible. When player B fails, both players exchange their roles. Players can then compare the number of rounds they passed in the role of player B. To prevent door open spamming, you can set a limit to the number of extra doors to open, but the game itself doesn't enforce that.

* Competitive mode (alternation): similar to rotation, but instead of waiting for one player to be defeated, players 1 and 2 exchange roles every round (of after N rounds). A player can only losing in the role of B, so the first player to miss a knocked door loses.

## Start game

Open index.html in a browser (with Javascript active).

* Click on the 1st line (ゲームをはじめる) to open the game page. Then click on the right button (スタート) to start the game.

* Click on the 2nd line (せつめいをみる) to read Japanese instructions.

### In-game

Click on the left button (ノック or あける) to knock (1st phase with the boy) or open (2nd phase with the girl) a door. If the button is focused, you can also just press Space or Enter.

## Context

The jam's theme was "What do we do now?", however this was only loosely followed and instead, all the games made in this location had the following constraint: make the game playable by people with impaired vision. The game meets this criterion by providing audio feedback from player 1's pattern to player 2 reproducing it. It also features very simple HTML to navigate in.

## Known issues

Unfortunately, a small audio desynchronization bug makes it difficult to reproduce the player 1's exact rhythm after a certain number of rounds, but the game remains playable overall.

## Video

[![Trailer](http://img.youtube.com/vi/GKgXORtnHEE/0.jpg)](https://youtu.be/GKgXORtnHEE)

## Credits

* Masaaki Fukunaga (福永正明): Programming support
* Hiroto Morokuma (諸熊 浩人): Programming
* Long Nguyen Huu: Programming
* Yasuhiro Chida (千田泰宏): Promotional movie, audio
* Haruka Kajikawa (梶川晴香): Animation, staff

... and everyone contributed a bit to game design!
