/**
 * Generates src/data/episodes.json from a compact source table.
 *
 * Air dates are computed from each season's premiere on a weekly cadence, so
 * the guide stays internally consistent instead of hand-maintained.
 *
 * Usage: node scripts/build-episodes.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// season, episode, title, titleJP, rating, tags, synopsis
const rows = [
  // ── Season 1 ──
  [1, 1, 'To You, in 2000 Years', '二千年後の君へ', 9.2, 'Key Moment,Lore', 'A hundred years of peace end the day the Colossal Titan appears above Wall Maria.'],
  [1, 2, 'That Day', 'その日', 9.3, 'Key Moment,Emotional', 'The fall of Shiganshina: Eren loses his mother, his home and his innocence in a single afternoon.'],
  [1, 3, 'A Dim Light Amid Despair', '絶望の中で鈍く光る', 8.7, 'Lore', 'Eren awakens in the refugee camp and learns what the walls really cost.'],
  [1, 4, 'The Night of the Closing Ceremony', '解散式の夜', 8.6, 'Lore', 'Training begins. Ten years of peace shatter into a single night of resolve.'],
  [1, 5, 'First Battle', '初陣', 9.0, 'Battle', 'Trost is breached and the 104th Cadet Corps faces a titan for the first time.'],
  [1, 6, 'The World the Girl Saw', '少女が見た世界', 9.4, 'Key Moment,Titan Reveal', 'Mikasa’s past is revealed as the cadets fight to survive the streets of Trost.'],
  [1, 7, 'Small Blade', '小さな刃', 8.9, 'Battle', 'Armin’s plan buys a blade’s length of hope against an impossible enemy.'],
  [1, 8, 'I Can Hear His Heartbeat', '心臓の鼓動が聞こえる', 8.8, 'Battle', 'Eren is swallowed — and something inside the titan begins to move.'],
  [1, 9, 'Whereabouts of His Left Arm', '左腕の行方', 9.1, 'Titan Reveal', 'A titan fights titans, and the garrison watches a boy step out of its spine.'],
  [1, 10, 'Response', '応える', 8.9, 'Lore,Battle', 'Eren’s transformation is covered up, and the plan to retake Trost begins.'],
  [1, 11, 'Idol', '偶像', 8.7, 'Lore', 'The boulder must reach the gate. Pixis gambles the lives of everyone behind him.'],
  [1, 12, 'Wound', '傷', 8.9, 'Battle', 'Eren’s body fails at the worst moment, and Mikasa steps into the gap.'],
  [1, 13, 'Primal Desire', '原初的欲求', 9.0, 'Key Moment', 'The gate is sealed. Humanity wins its first battle — and learns what Eren is worth.'],
  [1, 14, 'Can’t Look Into His Eyes Yet', 'まだ目を見れない', 8.5, 'Lore', 'A tribunal decides whether Eren is a weapon, a monster, or a soldier.'],
  [1, 15, 'Special Operations Squad', '特別作戦班', 8.8, 'Lore,Emotional', 'Levi takes custody of Eren. The Squad prepares for what comes next.'],
  [1, 16, 'What Needs to Be Done Now', '今、何をすべきか', 8.6, 'Lore', 'The 57th expedition departs with a lie on its back and a target on its heels.'],
  [1, 17, 'Female Titan', '女型の巨人', 9.2, 'Titan Reveal,Battle', 'An intelligent titan tears through the formation hunting Eren.'],
  [1, 18, 'Forest of Giant Trees', '巨大樹の森', 9.3, 'Battle', 'The trap is set in the canopy — and the Female Titan walks straight into it.'],
  [1, 19, 'Bite', '噛みつく', 9.1, 'Battle,Emotional', 'Levi’s squad dies defending a boy who cannot transform.'],
  [1, 20, 'Erwin Smith', 'エルヴィン・スミス', 9.0, 'Key Moment', 'The Commander’s gambit is revealed, and the Female Titan escapes.'],
  [1, 21, 'Crushing Blow', '猛進', 8.9, 'Battle', 'The Stohess operation begins; Annie Leonhart stops running.'],
  [1, 22, 'The Defeated', '敗者達', 9.3, 'Titan Reveal,Emotional', 'The Female Titan is unmasked inside Wall Sina, and crystallises before capture.'],
  [1, 23, 'Smile', '微笑み', 8.4, 'Lore', 'Aftermath: the dead are counted, the living are questioned, and Wall Rose is breached again.'],
  [1, 24, 'Mercy', '慈悲', 8.8, 'Battle', 'The supply squad turns on itself; Connie’s village is found silent.'],
  [1, 25, 'Wall', '壁', 9.0, 'Key Moment,Titan Reveal', 'A titan appears inside Wall Rose, and the season ends with a hand on a wall.'],

  // ── Season 2 ──
  [2, 1, 'Beast Titan', '獣の巨人', 9.5, 'Key Moment,Titan Reveal', 'The Beast Titan speaks. A wall is breached from the inside out.'],
  [2, 2, 'I’m Home', 'ただいま', 8.9, 'Lore', 'Sasha returns to her village and finds that hospitality has a price.'],
  [2, 3, 'Southwestward', '南西へ', 8.8, 'Battle', 'The scouts ride for Wall Rose, chasing a breach that may not exist.'],
  [2, 4, 'Soldier', '兵士', 9.4, 'Key Moment,Emotional', 'Utgard Castle falls, and a warrior learns what he is willing to do.'],
  [2, 5, 'Historia', 'ヒストリア', 8.8, 'Lore', 'A name is chosen: Historia Reiss means to live up to it.'],
  [2, 6, 'Warrior', '戦士', 9.7, 'Titan Reveal,Key Moment', 'Reiner and Bertholdt reveal themselves on the wall above Utgard.'],
  [2, 7, 'Close Combat', '打・投・極', 9.5, 'Battle', 'Eren fights the Armored Titan hand to hand and loses the will to win.'],
  [2, 8, 'The Hunters', '追う者', 9.2, 'Battle', 'The scouts pursue the traitors into the forest of giant trees.'],
  [2, 9, 'Opening', '開口', 9.3, 'Battle,Emotional', 'Hannes stands his ground. The Coordinate awakens.'],
  [2, 10, 'Children', '子供達', 9.0, 'Lore,Emotional', 'Reiner remembers the mission as Bertholdt prepares to burn the forest down.'],
  [2, 11, 'Charge', '突撃', 9.4, 'Battle,Key Moment', 'The Survey Corps’ suicidal charge gives Erwin a moment to speak truth.'],
  [2, 12, 'Scream', '叫び', 9.6, 'Key Moment,Emotional', 'Eren commands titans to his side, and a mother is saved too late.'],

  // ── Season 3 ──
  [3, 1, 'Smoke Signal', '狼煙', 9.0, 'Lore', 'The Survey Corps is hunted by the crown as a new enemy appears in the Interior.'],
  [3, 2, 'Pain', '痛み', 8.7, 'Battle', 'Levi’s squad fights the interior police in a wood outside Stohess.'],
  [3, 3, 'Old Story', '昔話', 8.8, 'Lore', 'Kenny Ackerman’s past is told, and Levi’s beginning with it.'],
  [3, 4, 'Trust', '信頼', 9.1, 'Key Moment', 'The plan to abduct Historia begins with a fake murder and a silenced crowd.'],
  [3, 5, 'Reply', '回答', 9.0, 'Lore', 'Historia is offered a throne. She answers with her own will.'],
  [3, 6, 'Sin', '罪', 9.2, 'Key Moment', 'Rod Reiss reveals the truth of the walls’ founding and his own crime.'],
  [3, 7, 'Wish', '願い', 9.3, 'Key Moment', 'Historia takes her father’s syringe and decides what kind of queen she will be.'],
  [3, 8, 'Outside the Walls of Orvud', 'オルブド区外壁', 9.1, 'Battle', 'A 120-metre titan crawls toward the district. The cadets hold the wall.'],
  [3, 9, 'Ruler of the Walls', '壁の王', 9.2, 'Key Moment', 'Historia shatters her father’s titan, and the Reiss chapel collapses.'],
  [3, 10, 'Friends', '友人', 8.9, 'Lore,Emotional', 'Eren’s father’s journal becomes the only path forward.'],
  [3, 11, 'Bystander', '傍観者', 9.0, 'Emotional', 'The Survey Corps returns to Shiganshina with a plan, a press corps and a debt.'],
  [3, 12, 'Night of the Battle to Retake the Wall', '奪還作戦の夜', 9.1, 'Lore', 'The night before departure, every soldier makes their peace.'],
  [3, 13, 'The Town Where Everything Began', 'はじまりの街', 9.4, 'Battle', 'The retaking of Shiganshina begins in perfect, terrible silence.'],
  [3, 14, 'Thunder Spears', '雷槍', 9.3, 'Battle', 'The Armored Titan is brought to its knees by a weapon built for it.'],
  [3, 15, 'Descent', '光臨', 9.5, 'Titan Reveal,Battle', 'The Beast Titan enters the field, and the formation is annihilated.'],
  [3, 16, 'Perfect Game', '完全試合', 9.7, 'Battle,Emotional', 'Zeke pitches. Erwin’s gamble costs the lives of his soldiers.'],
  [3, 17, 'Hero', '勇者', 9.9, 'Key Moment,Emotional', 'Armin holds the Colossal Titan long enough for the impossible.'],
  [3, 18, 'Midnight Sun', '白夜', 9.9, 'Key Moment,Emotional', 'One syringe, two bodies, and a choice that defines the Survey Corps.'],
  [3, 19, 'The Basement', '地下室', 9.8, 'Lore,Key Moment', 'The door opens. Grisha’s journal rewrites everything the scouts know.'],
  [3, 20, 'That Day', 'あの日', 9.7, 'Lore,Emotional', 'Grisha’s memories: Marley, the restorationists and the Attack Titan’s burden.'],
  [3, 21, 'Attack Titan', '進撃の巨人', 9.8, 'Key Moment,Lore', 'The Attack Titan has always moved forward, across memory and time.'],
  [3, 22, 'The Other Side of the Wall', '壁の向こう側', 9.9, 'Key Moment,Emotional', 'The sea. For the first time, the horizon is not a wall — and Eren asks the question.'],

  // ── Season 4 ──
  [4, 1, 'The Other Side of the Sea', '海の向こう側', 9.4, 'Lore', 'Four years later, a boy in Liberio runs through a war he does not understand.'],
  [4, 2, 'Midnight Train', '暗闇の列車', 9.0, 'Lore', 'Marley’s war ends, and the warriors come home to a country that uses them.'],
  [4, 3, 'The Door of Hope', '希望の扉', 9.1, 'Lore,Emotional', 'Falco meets a wounded soldier in a hospital and changes a history.'],
  [4, 4, 'From One Hand to Another', '手から手へ', 9.2, 'Lore', 'Letters, memories and a festival invitation arrive in Liberio.'],
  [4, 5, 'Declaration of War', '宣戦布告', 9.8, 'Key Moment', 'Willy Tybur declares war on Paradis. Eren answers from the audience.'],
  [4, 6, 'The War Hammer Titan', '戦槌の巨人', 9.6, 'Titan Reveal,Battle', 'A new titan enters the fight beneath the stage, and the survey corps descends.'],
  [4, 7, 'Assault', '強襲', 9.7, 'Battle', 'The raid on Liberio becomes a massacre on both sides of the fence.'],
  [4, 8, "Assassin's Bullet", '凶弾', 9.5, 'Key Moment,Emotional', 'Sasha Blouse dies on an airship, and a boy hears a name he will never forget.'],
  [4, 9, 'Brave Volunteers', '義勇兵', 9.0, 'Lore', 'Paradis learns to build a navy and to mistrust the people building it.'],
  [4, 10, 'A Sound Argument', '正論', 9.1, 'Lore', 'Hizuru’s offer, Kiyomi’s eyes and the cold mathematics of survival.'],
  [4, 11, 'Deceiver', '偽り者', 8.9, 'Lore', 'A coup inside the walls, and a wine cellar nobody counted.'],
  [4, 12, 'Guides', '導く者', 9.0, 'Emotional', 'Nicolo serves a meal that becomes an apology and a reckoning.'],
  [4, 13, 'Children of the Forest', '森の子供達', 9.3, 'Emotional,Lore', 'Sasha’s family meets the girl who shot her, and chooses.'],
  [4, 14, 'Savagery', '暴悪', 9.2, 'Battle', 'The Jaegerist uprising spills across the island in a single night.'],
  [4, 15, 'Sole Salvation', '唯一の救い', 9.1, 'Lore', 'Zeke and Ksaver: the making of a man who would end his own people.'],
  [4, 16, 'Above and Below', '天と地', 9.4, 'Key Moment', 'The survey corps splits between those who follow Eren and those who stop him.'],
  [4, 17, 'Judgement', '断罪', 9.3, 'Battle', 'The Marleyan fleet arrives at Shiganshina, and the Nine collide.'],
  [4, 18, 'Sneak Attack', '騙し討ち', 9.5, 'Battle,Key Moment', 'A coordinated ambush turns the port into a graveyard of airships.'],
  [4, 19, 'Two Brothers', '兄と弟', 9.6, 'Key Moment', 'Eren and Zeke meet inside the Paths, and the world goes quiet.'],
  [4, 20, 'Memories of the Future', '未来の記憶', 9.9, 'Key Moment,Lore', 'The Founding Titan shows Eren a future he has already chosen.'],
  [4, 21, 'From You, 2000 Years Ago', '二千年前の君から', 9.9, 'Lore,Key Moment', 'Ymir’s choice, and the origin of all titans, is finally spoken.'],
  [4, 22, 'Thaw', '氷解', 9.2, 'Emotional', 'The Rumbling begins. Annie returns to a world she no longer recognises.'],
  [4, 23, 'Sunset', '夕焼け', 9.1, 'Emotional', 'Two fronts, one sunset; old enemies share a campfire because there is nothing else left.'],
  [4, 24, 'Pride', '矜持', 9.3, 'Battle', 'A port is taken, a titan falls, and the alliance loses someone irreplaceable.'],
  [4, 25, 'Night of the End', '終末の夜', 9.4, 'Lore,Emotional', 'Confessions around a fire: what each of them is guilty of, and why they fight anyway.'],
  [4, 26, 'Traitor', '裏切り者', 9.5, 'Battle,Key Moment', 'The alliance reaches Fort Salta and finds the founder waiting.'],
  [4, 27, 'Retrospective', '懐古', 9.6, 'Emotional,Key Moment', 'In the Paths, Armin reminds Zeke what small things are worth living for.'],
  [4, 28, 'The Dawn', '暁', 9.8, 'Key Moment,Emotional', 'The Rumbling stops. The world remains, changed beyond recognition — and so do they.'],
]

const seasonMeta = {
  1: { premiere: '2013-04-07', label: 'Season 1', year: '2013', studioNote: 'WIT Studio · 25 episodes' },
  2: { premiere: '2017-04-01', label: 'Season 2', year: '2017', studioNote: 'WIT Studio · 12 episodes' },
  3: { premiere: '2018-07-23', label: 'Season 3', year: '2018–2019', studioNote: 'WIT Studio · 22 episodes' },
  4: { premiere: '2020-12-07', label: 'Final Season', year: '2020–2023', studioNote: 'MAPPA · 28 episodes' },
}

const counts = {}
for (const row of rows) counts[row[0]] = (counts[row[0]] ?? 0) + 1

const FINAL_SPECIALS = {
  26: '2023-03-04',
  27: '2023-03-04',
  28: '2023-11-04',
}

const episodes = rows.map(([season, episode, title, titleJP, rating, tags, synopsis]) => {
  const meta = seasonMeta[season]
  let date
  if (season === 4 && FINAL_SPECIALS[episode]) {
    date = new Date(`${FINAL_SPECIALS[episode]}T00:00:00Z`)
  } else if (season === 3 && episode > 12) {
    date = new Date('2019-04-29T00:00:00Z')
    date.setUTCDate(date.getUTCDate() + (episode - 13) * 7)
  } else if (season === 4 && episode > 16) {
    date = new Date('2022-01-10T00:00:00Z')
    date.setUTCDate(date.getUTCDate() + (episode - 17) * 7)
  } else {
    date = new Date(`${meta.premiere}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() + (episode - 1) * 7)
  }
  return {
    season,
    episode,
    title,
    titleJP,
    airDate: date.toISOString().slice(0, 10),
    rating,
    synopsis,
    tags: tags.split(','),
  }
})

const seasons = Object.entries(seasonMeta).map(([season, meta]) => ({
  season: Number(season),
  label: meta.label,
  year: meta.year,
  episodeCount: counts[season],
  studioNote: meta.studioNote,
}))

const outDir = resolve(__dirname, '../src/data')
mkdirSync(outDir, { recursive: true })
writeFileSync(resolve(outDir, 'episodes.json'), JSON.stringify(episodes, null, 2) + '\n')
writeFileSync(resolve(outDir, 'seasons.json'), JSON.stringify(seasons, null, 2) + '\n')
console.log(`Wrote ${episodes.length} episodes across ${seasons.length} seasons.`)
