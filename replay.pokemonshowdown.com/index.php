<?php

/**
 * index.php
 *
 * Grabs some data to prepopulate a Replay page.
 *
 * `src/replays-battle.tsx` can also grab this data from our APIs, but
 * doing it here makes it load faster, and also tells Google, Discord's
 * link preview, and other bots which replays actually exist, and what
 * their titles/descriptions are.
 *
 * It also puts the replay log in the source, so you can easily look at
 * it by viewing source.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

$manage = false;
if (isset($_REQUEST['manage'])) {
	require_once '../lib/ntbb-session.lib.php';
	if (!$users->isLeader()) die("access denied");
	$csrfOk = !!$users->csrfCheck();
	$manage = true;
	header('Cache-Control: max-age=0, no-cache, no-store, must-revalidate');
}

$replay = null;
$id = $_REQUEST['name'] ?? '';
$password = '';

$fullid = $id;
if (substr($id, -2) === 'pw') {
	$dashpos = strrpos($id, '-');
	$password = substr($id, $dashpos + 1, -2);
	$id = substr($id, 0, $dashpos);
	// die($id . ' ' . $password);
}

// $forcecache = isset($_REQUEST['forcecache8723']);
$forcecache = false;
if ($id) {
	if (file_exists('caches/' . $id . '.inc.php')) {
		include 'caches/' . $id . '.inc.php';
		$replay['formatid'] = '';
		$cached = true;
		$replay['log'] = str_replace("\r","",$replay['log']);
		$replay['players'] = [$replay['p1'], $replay['p2']];
		$matchSuccess = preg_match('/\\n\\|tier\\|([^|]*)\\n/', $replay['log'], $matches);
		if ($matchSuccess) $replay['format'] = $matches[1];
		if (@$replay['date']) {
			$replay['uploadtime'] = $replay['date'];
			unset($replay['date']);
		}
	} else {
		require_once 'replays.lib.php';
		if (!$Replays->db && !$forcecache) {
			header('HTTP/1.1 503 Service Unavailable');
			die();
		}
		$replay = $Replays->get($id, $forcecache);
	}
	if (!$replay) {
		header('HTTP/1.1 404 Not Found');
		include '404.html';
		die();
	}
	if ($replay['password'] ?? null) {
		if ($password !== $replay['password']) {
			header('HTTP/1.1 404 Not Found');
			include '404.html';
			die();
		}
	}
}

$title = '';
if ($replay) {
	$title = htmlspecialchars($replay['format'].': '.implode(' vs. ', $replay['players']).' - ');
}

?><!DOCTYPE html>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />

<title><?= $title ?>Replays - Pok&eacute;mon Showdown!</title>

<?php
if ($replay) echo '<meta name="description" content="Watch a replay of a Pok&eacute;mon battle between '.htmlspecialchars(implode(' and ', $replay['players'])).'! Format: '.htmlspecialchars($replay['format']).'; Date: '.date("M j, Y", @$replay['uploadtime']).'" />';
?>

<!--

Hey, you! Looking in the source for the replay log?

You can find them in JSON format, just add `.json` at the end of a replay URL.

https://replay.pokemonshowdown.com/gen7randomdoublesbattle-865046831.json

Or, if you only need the log itself, add `.log` instead:

https://replay.pokemonshowdown.com/gen7randomdoublesbattle-865046831.log

-->

<link rel="stylesheet" href="//pokemonshowdown.com/style/global.css?0.08954886773049042" />
<link rel="stylesheet" href="//play.pokemonshowdown.com/style/font-awesome.css?0.12782459912334643" />
<link rel="stylesheet" href="//play.pokemonshowdown.com/style/battle.css?0.16749264146602094" />
<link rel="stylesheet" href="//play.pokemonshowdown.com/style/utilichart.css?0.33614162929863267" />

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-26211653-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-26211653-1');
</script>
<!-- End Google Analytics -->
<!-- Venatus Ad Manager - Install in <HEAD> of page -->
	<script src="https://hb.vntsm.com/v3/live/ad-manager.min.js" type="text/javascript" data-site-id="642aba63ec9a7b11c3c9c1be" data-mode="scan" async></script>
<!-- / Venatus Ad Manager -->

<style>
	@media (max-width:820px) {
		.battle {
			margin: 0 auto;
		}
		.battle-log {
			margin: 7px auto 0;
			max-width: 640px;
			height: 300px;
			position: static;
		}
	}
	.optgroup {
		display: inline-block;
		line-height: 22px;
		font-size: 10pt;
		vertical-align: top;
	}
	.optgroup .button {
		height: 25px;
		padding-top: 0;
		padding-bottom: 0;
	}
	.optgroup button.button {
		padding-left: 12px;
		padding-right: 12px;
	}
	.linklist {
		list-style: none;
		margin: 0.5em 0;
		padding: 0;
	}
	.linklist li {
		padding: 2px 0;
	}
	.sidebar {
		float: left;
		width: 320px;
	}
	.bar-wrapper {
		max-width: 1100px;
		margin: 0 auto;
	}
	.bar-wrapper.has-sidebar {
		max-width: 1430px;
	}
	.mainbar {
		margin: 0;
		padding-right: 1px;
	}
	.mainbar.has-sidebar {
		margin-left: 330px;
	}
	@media (min-width: 1511px) {
		.sidebar {
			width: 400px;
		}
		.bar-wrapper.has-sidebar {
			max-width: 1510px;
		}
		.mainbar.has-sidebar {
			margin-left: 410px;
		}
	}
	.section.first-section {
		margin-top: 9px;
	}
	.blocklink small {
		white-space: normal;
	}
	.button {
		vertical-align: middle;
	}
	.replay-controls {
		padding-top: 10px;
	}
	.replay-controls h1 {
		font-size: 16pt;
		font-weight: normal;
		color: #CCC;
	}
	.pagelink {
		text-align: center;
	}
	.pagelink a {
		width: 150px;
	}
	.textbox, .button {
		font-size: 11pt;
		vertical-align: middle;
	}
	@media (max-width: 450px) {
		.button {
			font-size: 9pt;
		}
	}
</style>

<div>

	<header>
		<div class="nav-wrapper"><ul class="nav">
			<li><a class="button nav-first" href="//pokemonshowdown.com/"><img src="//pokemonshowdown.com/images/pokemonshowdownbeta.png" srcset="//pokemonshowdown.com/images/pokemonshowdownbeta.png 1x, //pokemonshowdown.com/images/pokemonshowdownbeta@2x.png 2x" alt="Pok&eacute;mon Showdown" width="146" height="44" /> Home</a></li>
			<li><a class="button" href="//pokemonshowdown.com/dex/">Pok&eacute;dex</a></li>
			<li><a class="button cur" href="/">Replay</a></li>
			<li><a class="button purplebutton" href="//smogon.com/dex/" target="_blank">Strategy</a></li>
			<li><a class="button nav-last purplebutton" href="//smogon.com/forums/" target="_blank">Forum</a></li>
			<li><a class="button greenbutton nav-first nav-last" href="//play.pokemonshowdown.com/">Play</a></li>
		</ul></div>
	</header>

	<div class="main" id="main">

		<noscript><section class="section">You need to enable JavaScript to use this page; sorry!</section></noscript>

	</div>

</div>

<script defer nomodule src="//play.pokemonshowdown.com/js/lib/ps-polyfill.js"></script>
<script defer src="//play.pokemonshowdown.com/js/lib/preact.min.js"></script>

<script defer src="//play.pokemonshowdown.com/config/config.js?c33581c2"></script>
<script defer src="//play.pokemonshowdown.com/js/lib/jquery-1.11.0.min.js"></script>
<script defer src="//play.pokemonshowdown.com/js/lib/html-sanitizer-minified.js"></script>
<script defer src="//play.pokemonshowdown.com/js/battle-sound.js"></script>
<script defer src="//play.pokemonshowdown.com/js/battledata.js?0.25294950929625337"></script>
<script defer src="//play.pokemonshowdown.com/data/pokedex-mini.js?0.5453211792864432"></script>
<script defer src="//play.pokemonshowdown.com/data/pokedex-mini-bw.js?0.6137587233757287"></script>
<script defer src="//play.pokemonshowdown.com/data/graphics.js?0.7476319865702811"></script>
<script defer src="//play.pokemonshowdown.com/data/pokedex.js?0.5650727389494217"></script>
<script defer src="//play.pokemonshowdown.com/data/moves.js?0.9853405747326485"></script>
<script defer src="//play.pokemonshowdown.com/data/abilities.js?0.46625353200134967"></script>
<script defer src="//play.pokemonshowdown.com/data/items.js?0.24170586024963336"></script>
<script defer src="//play.pokemonshowdown.com/data/teambuilder-tables.js?0.1808799975297628"></script>
<script defer src="//play.pokemonshowdown.com/js/battle-tooltips.js?0.5026032417169642"></script>
<script defer src="//play.pokemonshowdown.com/js/battle.js?0.22740967051401795"></script>

<script defer src="/js/utils.js?0.8535931557859694"></script>
<script defer src="/js/replays-battle.js?0.6669823276128786"></script>
<script defer src="/js/replays-index.js?0.8191552914474807"></script>

<?php

if ($replay) {
	// `src/repays-battle.tsx` can also grab this data from our APIs, but
	// doing it here increases page load speed
	echo "<!-- don't scrape this data! just add .json or .log after the URL!\nFull API docs: https://github.com/smogon/pokemon-showdown-client/blob/master/WEB-API.md -->\n";
	echo '<script type="text/plain" class="log" id="replaylog-'.$fullid.'">'."\n";
	echo str_replace('</', '<\\/', $replay['log'])."\n";
	echo '</script>'."\n";
	if (@$replay['safe_inputlog'] || $manage) {
		if (!$replay['safe_inputlog']) echo '<!-- only available with ?manage -->'."\n";
		echo '<script type="text/plain" class="inputlog" id="replayinputlog-'.$fullid.'">'."\n";
		echo str_replace('</', '<\\/', $replay['inputlog'])."\n";
		echo '</script>'."\n";
	}
	unset($replay['log']);
	unset($replay['inputlog']);
	unset($replay['safe_inputlog']);
	echo '<script type="application/json" class="data" id="replaydata-'.$fullid.'">'."\n";
	echo json_encode($replay)."\n";
	echo '</script>'."\n";
}

?>

<script defer src="/js/replays.js?0.11178534086270031"></script>
