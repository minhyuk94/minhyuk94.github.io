// 오늘의 운세: 날짜(와 생년월일)로 정해지는 재미용 운세. 같은 날·같은 사람이면 늘 같은 결과.
// 한국어·일본어·영어는 같은 번호의 문구라서, 언어를 바꿔도 점수와 뜻은 같다.
// 화면(index.html)과 테스트(fortune.test.mjs)가 함께 쓴다. 문구는 모두 새로 쓴 것 (속담 몇 개 제외).

export const LANGS = ['ko', 'ja', 'en'];

/** 글자 → 32비트 해시 (FNV-1a) */
export function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
/** 씨앗으로 정해지는 난수 (0 이상 1 미만) */
export function rng(seed) {
  let a = hash(seed) || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const idx = (r, n) => Math.floor(r() * n);

/** 로컬 날짜를 "2026-11-10" 으로 */
export function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── 띠·별자리 ──
const A = (id, emoji, ko, ja, en, jaEmoji) => ({ id, emoji, jaEmoji: jaEmoji || emoji, name: { ko, ja, en } });
export const ANIMALS = [
  A('rat', '🐭', '쥐띠', 'ねずみ年', 'Rat'), A('ox', '🐮', '소띠', 'うし年', 'Ox'), A('tiger', '🐯', '호랑이띠', 'とら年', 'Tiger'),
  A('rabbit', '🐰', '토끼띠', 'うさぎ年', 'Rabbit'), A('dragon', '🐲', '용띠', 'たつ年', 'Dragon'), A('snake', '🐍', '뱀띠', 'へび年', 'Snake'),
  A('horse', '🐴', '말띠', 'うま年', 'Horse'), A('sheep', '🐑', '양띠', 'ひつじ年', 'Goat'), A('monkey', '🐵', '원숭이띠', 'さる年', 'Monkey'),
  A('rooster', '🐔', '닭띠', 'とり年', 'Rooster'), A('dog', '🐶', '개띠', 'いぬ年', 'Dog'),
  // 일본에서는 열두 번째가 돼지가 아니라 멧돼지
  A('pig', '🐷', '돼지띠', 'いのしし年', 'Pig', '🐗'),
];
/** 태어난 해 → 띠 (양력 해 기준) */
export function animalOf(year) {
  return ANIMALS[(((year - 4) % 12) + 12) % 12];
}
/** 띠 이름·그림을 언어에 맞게 */
export function animalLabel(a, lang) {
  return { name: a.name[lang] ?? a.name.ko, emoji: lang === 'ja' ? a.jaEmoji : a.emoji };
}

// [기호, 그 달의 마지막 날(이 날까지 이 별자리), ko, ja, en]
export const SIGNS = [
  ['♑', 19, '염소자리', 'やぎ座', 'Capricorn'], ['♒', 18, '물병자리', 'みずがめ座', 'Aquarius'], ['♓', 20, '물고기자리', 'うお座', 'Pisces'],
  ['♈', 19, '양자리', 'おひつじ座', 'Aries'], ['♉', 20, '황소자리', 'おうし座', 'Taurus'], ['♊', 21, '쌍둥이자리', 'ふたご座', 'Gemini'],
  ['♋', 22, '게자리', 'かに座', 'Cancer'], ['♌', 22, '사자자리', 'しし座', 'Leo'], ['♍', 22, '처녀자리', 'おとめ座', 'Virgo'],
  ['♎', 23, '천칭자리', 'てんびん座', 'Libra'], ['♏', 22, '전갈자리', 'さそり座', 'Scorpio'], ['♐', 21, '사수자리', 'いて座', 'Sagittarius'],
];
/** 생일 → 별자리 [이름, 기호] */
export function signOf(month, day, lang = 'ko') {
  const i = month - 1;
  const s = day <= SIGNS[i][1] ? SIGNS[i] : SIGNS[(i + 1) % 12];
  return [s[2 + LANGS.indexOf(lang)] ?? s[2], s[0]];
}

// ── 문구 (언어마다 같은 모양·같은 순서) ──
export const TEXT = {
  ko: {
    total: [
      ['서두르면 꼬이는 날이에요. 한 박자 쉬고 움직이면 손해를 피할 수 있어요.', '작은 실수가 눈덩이처럼 커질 수 있어요. 확인을 두 번 하세요.', '오늘은 새로 벌이기보다 하던 일을 정리하기 좋은 날이에요.', '기대보다 더딘 하루지만, 지나고 보면 쉬어 가는 날이었다고 느낄 거예요.'],
      ['큰 일은 없지만 사소한 일에 마음이 흔들릴 수 있어요. 기준을 하나 정해 두세요.', '평범하게 흘러가는 날. 무리하지 않으면 무난하게 마무리돼요.', '해야 할 일 목록을 줄이면 오히려 더 많이 끝낼 수 있어요.', '남의 말보다 내 감을 믿어도 되는 날이에요. 다만 말은 부드럽게.'],
      ['미뤄 둔 일을 하나 끝내면 하루가 가벼워져요.', '작은 행운이 군데군데 숨어 있어요. 주변을 잘 둘러보세요.', '꾸준히 해 온 일이 조금씩 빛을 보기 시작해요.', '반가운 연락이 기분을 끌어올려 줄 거예요.'],
      ['하는 일마다 손발이 척척 맞는 날이에요. 자신 있게 밀어붙이세요.', '생각보다 일이 빨리 풀려요. 남는 시간은 나를 위해 쓰세요.', '사람 운이 좋아요. 먼저 말을 걸면 좋은 인연으로 이어져요.', '머릿속으로만 그리던 계획을 꺼내 보기 좋은 날이에요.'],
      ['오늘은 흐름이 내 편이에요. 망설이던 일에 첫발을 떼 보세요.', '노력한 만큼, 아니 그 이상으로 돌아오는 날이에요.', '반짝이는 아이디어가 떠오르면 바로 적어 두세요. 큰 일이 될 수 있어요.', '웃을 일이 많은 하루. 그 기운을 주변에도 나눠 주세요.'],
    ],
    parts: {
      money: ['금전', [
        ['충동구매를 조심하세요. 장바구니는 내일 다시 보기.', '지갑이 가볍게 느껴지는 날. 작은 지출부터 점검해 보세요.', '빌려주는 돈은 돌아오기 어려운 날이에요.'],
        ['들어오는 만큼 나가는 날. 계획대로만 쓰면 괜찮아요.', '오래 고민하던 물건은 오늘 말고 주말에.', '잔돈을 모으면 생각보다 쏠쏠해요.'],
        ['뜻밖의 작은 수입이나 할인이 생길 수 있어요.', '아껴 둔 것이 쓸모를 찾는 날이에요.', '돈 이야기를 꺼내기 좋은 날. 협상이 잘 풀려요.']]],
      love: ['애정', [
        ['말 한마디가 오해를 부를 수 있어요. 오늘은 듣는 쪽이 되어 주세요.', '서운한 마음은 쌓아 두지 말고 가볍게 털어놓으세요.', '혼자만의 시간이 오히려 관계를 지켜 줘요.'],
        ['잔잔하고 편안한 하루. 함께 밥 한 끼면 충분해요.', '오래된 친구에게 안부를 물어보세요.', '사소한 약속을 지키는 것이 큰 믿음이 돼요.'],
        ['눈이 마주치면 먼저 웃어 보세요. 좋은 일이 생겨요.', '고백이나 화해에 좋은 날이에요.', '연락이 뜸했던 사람이 먼저 손을 내밀어요.']]],
      health: ['건강', [
        ['피로가 쌓이기 쉬워요. 오늘은 일찍 잠자리에 드세요.', '목과 어깨를 자주 풀어 주세요.', '찬 음식보다 따뜻한 국물이 좋아요.'],
        ['물을 자주 마시면 몸이 가벼워져요.', '가벼운 산책이 기분 전환에 딱이에요.', '화면을 오래 보면 눈이 지쳐요. 틈틈이 먼 곳을 보세요.'],
        ['몸이 가벼운 날. 미뤄 둔 운동을 시작하기 좋아요.', '푹 잔 만큼 하루가 상쾌해요.', '좋아하는 음식이 기운을 채워 줘요.']]],
      work: ['일·공부', [
        ['꼼꼼함이 필요한 날. 숫자와 날짜를 다시 확인하세요.', '혼자 끌어안지 말고 도움을 청하세요.', '큰 결정은 하루만 미뤄도 늦지 않아요.'],
        ['하던 일을 차근차근. 순서만 지키면 막힘이 없어요.', '회의나 수업에서 메모가 나중에 큰 도움이 돼요.', '새로운 것보다 복습이 잘 되는 날이에요.'],
        ['집중력이 좋아요. 어려운 일을 먼저 처리하세요.', '내 의견이 잘 받아들여지는 날이에요.', '배운 것이 바로 써먹히는 하루예요.']]],
    },
    colors: ['빨강', '주황', '노랑', '연두', '초록', '하늘', '파랑', '보라', '분홍', '갈색', '흰색', '검정', '금색', '은색'],
    items: ['손수건', '볼펜', '따뜻한 차', '이어폰', '작은 수첩', '거울', '우산', '초콜릿', '반지', '머리끈', '향기 좋은 핸드크림', '동전 하나', '좋아하는 노래', '운동화', '사진 한 장', '열쇠고리', '책갈피', '귤'],
    dirs: ['동쪽', '서쪽', '남쪽', '북쪽', '남동쪽', '남서쪽', '북동쪽', '북서쪽'],
    times: ['이른 아침', '오전', '점심 무렵', '오후', '해 질 녘', '저녁', '늦은 밤'],
    words: ['천천히 가도 멈추지만 않으면 된다.', '오늘의 작은 친절이 내일의 큰 행운이 된다.', '모르는 길은 물어 가면 된다.', '잘한 일 하나를 떠올리며 잠들자.', '완벽보다 완성이 먼저다.', '웃는 얼굴에 복이 들어온다.', '비 온 뒤에 땅이 굳는다.', '내가 아끼는 것을 오늘 한 번 더 아끼자.', '시작이 반, 나머지 반은 꾸준함.', '마음이 급할수록 숨을 한 번 고르자.', '좋은 사람 곁에 좋은 일이 모인다.', '어제보다 한 걸음이면 충분하다.', '듣는 귀가 열리면 길이 보인다.', '작은 정리가 큰 여유를 만든다.', '오늘 심은 씨앗은 언젠가 꽃이 된다.', '고마운 사람에게 한마디 건네자.', '하기 싫은 일 하나를 먼저 끝내자.', '내 속도대로 가도 괜찮다.', '실수는 다음을 위한 연습이다.', '배부른 밥 한 끼가 보약이다.'],
    animal: [
      ['조금 쉬어 가도 괜찮은 날', '말을 아끼면 득이 되는 날', '정리하면 길이 보이는 날'],
      ['무난하게 흘러가는 날', '작은 기쁨이 있는 날', '약속을 잘 지키면 좋은 날'],
      ['반가운 소식이 오는 날', '손이 빠르게 움직이는 날', '사람 운이 좋은 날'],
      ['기운이 넘치는 날', '하는 일마다 잘 풀리는 날', '도전해 볼 만한 날'],
    ],
  },
  ja: {
    total: [
      ['急ぐと空回りしがちな日。ひと呼吸おいてから動けば、損を避けられます。', '小さなミスが大きくなりやすい日。確認は二回しましょう。', '新しく始めるより、今ある用事を片付けるのに向いた日です。', '思うように進まない一日でも、振り返ればいい休憩だったと感じるはず。'],
      ['大きな出来事はなくても、小さなことで心が揺れやすい日。自分の基準をひとつ決めておきましょう。', '平穏に流れる一日。無理をしなければ、穏やかに終わります。', 'やることリストを減らすと、かえってたくさん片付きます。', '人の意見より自分の勘を信じていい日。ただし言葉はやわらかく。'],
      ['後回しにしていたことをひとつ終わらせると、一日が軽くなります。', '小さな幸運があちこちに隠れています。周りをよく見てみて。', 'コツコツ続けてきたことが、少しずつ実を結び始めます。', 'うれしい連絡が気分を上げてくれそう。'],
      ['何をしてもスムーズに運ぶ日。自信を持って進みましょう。', '思ったより早く片付きます。空いた時間は自分のために。', '人の縁に恵まれる日。自分から声をかけると、いい出会いにつながります。', '頭の中で温めていた計画を、形にしてみるのにいい日です。'],
      ['今日は流れがあなたの味方。迷っていたことに最初の一歩を。', '努力した分、いえ、それ以上に返ってくる日です。', 'ひらめいたらすぐメモを。大きなことにつながるかもしれません。', '笑顔の多い一日。その元気を周りにも分けてあげて。'],
    ],
    parts: {
      money: ['金運', [
        ['衝動買いに注意。カートの中身は明日もう一度見直して。', '財布が軽く感じる日。小さな出費から見直してみて。', '人に貸したお金は戻りにくい日です。'],
        ['入った分だけ出ていく日。予定どおりに使えば大丈夫。', '長く迷っている買い物は、今日ではなく週末に。', '小銭を集めると、思ったより貯まります。'],
        ['思いがけない小さな収入や割引がありそう。', 'とっておいたものが役に立つ日です。', 'お金の話を切り出すのにいい日。交渉がうまくいきます。']]],
      love: ['恋愛', [
        ['ひと言が誤解を招きやすい日。今日は聞き役に回って。', 'さみしい気持ちはため込まず、軽く打ち明けて。', 'ひとりの時間が、かえって関係を守ってくれます。'],
        ['穏やかで落ち着いた一日。一緒にごはんを食べるだけで十分。', '古い友人に近況を聞いてみて。', '小さな約束を守ることが、大きな信頼になります。'],
        ['目が合ったら先に笑ってみて。いいことが起きます。', '告白や仲直りにぴったりの日。', 'しばらく連絡のなかった人から声がかかります。']]],
      health: ['健康', [
        ['疲れがたまりやすい日。今夜は早めに休んで。', '首や肩をこまめにほぐしましょう。', '冷たいものより、温かいスープがおすすめ。'],
        ['こまめに水を飲むと体が軽くなります。', '軽い散歩が気分転換にぴったり。', '画面の見すぎは目の疲れのもと。ときどき遠くを見て。'],
        ['体が軽い日。後回しにしていた運動を始めるチャンス。', 'ぐっすり眠れた分、一日が爽やか。', '好きな食べ物が元気をくれます。']]],
      work: ['仕事・勉強', [
        ['丁寧さが必要な日。数字と日付はもう一度確認を。', 'ひとりで抱え込まず、助けを求めて。', '大きな決断は一日延ばしても遅くありません。'],
        ['いつもの作業をひとつずつ。順番を守ればつまずきません。', '会議や授業のメモが、あとで役立ちます。', '新しいことより、復習がはかどる日。'],
        ['集中力が高い日。難しいことから片付けて。', 'あなたの意見が受け入れられやすい日です。', '学んだことがすぐに活かせる一日。']]],
    },
    colors: ['赤', 'オレンジ', '黄色', '黄緑', '緑', '水色', '青', '紫', 'ピンク', '茶色', '白', '黒', '金色', '銀色'],
    items: ['ハンカチ', 'ボールペン', '温かいお茶', 'イヤホン', '小さな手帳', '手鏡', '傘', 'チョコレート', '指輪', 'ヘアゴム', 'いい香りのハンドクリーム', '硬貨1枚', '好きな曲', 'スニーカー', '写真1枚', 'キーホルダー', 'しおり', 'みかん'],
    dirs: ['東', '西', '南', '北', '南東', '南西', '北東', '北西'],
    times: ['早朝', '午前中', 'お昼ごろ', '午後', '夕暮れ', '夜', '深夜'],
    words: ['ゆっくりでも、止まらなければいい。', '今日の小さな親切が、明日の大きな幸運に。', '知らない道は、聞きながら行けばいい。', 'うまくいったことをひとつ思い出して眠ろう。', '完璧より、まず完成。', '笑う門には福来る。', '雨降って地固まる。', '大切なものを、今日もう一度大切に。', '始めれば半分、残りの半分は続けること。', '焦るときほど、ひと呼吸。', 'いい人のそばには、いいことが集まる。', '昨日より一歩進めば十分。', '耳を傾ければ、道が見えてくる。', '小さな片付けが、大きなゆとりを生む。', '今日まいた種は、いつか花になる。', 'ありがとうの一言を伝えよう。', '気の進まないことを、ひとつ先に終わらせよう。', '自分のペースで大丈夫。', '失敗は、次のための練習。', 'おなかいっぱいのごはんが、一番の薬。'],
    animal: [
      ['少し休んでもいい日', '口数を控えると得をする日', '片付けると道が見える日'],
      ['穏やかに過ぎる日', '小さな喜びがある日', '約束を守るといい日'],
      ['うれしい知らせが届く日', '手際よく進む日', '人の縁に恵まれる日'],
      ['元気があふれる日', '何をしてもうまくいく日', '挑戦してみたくなる日'],
    ],
  },
  en: {
    total: [
      ["Rushing will tangle things today. Take a breath before you move and you'll avoid losses.", 'Small slips can snowball. Double-check everything.', 'A better day for wrapping up what you have than starting something new.', "Things move slower than you'd like, but later it will feel like a well-earned pause."],
      ['Nothing big happens, but small things may rattle you. Set yourself one simple rule.', "An ordinary day. Don't push too hard and it ends smoothly.", "Shorten your to-do list and you'll actually finish more.", "Trust your gut over other people's opinions today. Just say it gently."],
      ["Finish one thing you've been putting off and the whole day feels lighter.", 'Little bits of luck are hiding here and there. Keep your eyes open.', "The steady work you've put in starts to pay off, little by little.", 'A welcome message will lift your mood.'],
      ['Everything clicks today. Go for it with confidence.', 'Things wrap up faster than expected. Spend the extra time on yourself.', 'A great day for people. Say hello first and it may become a good connection.', "A good day to bring out the plan you've only pictured in your head."],
      ["The current is on your side. Take the first step on what you've been hesitating about.", "What you've put in comes back, and then some.", 'Write down any bright idea right away. It could become something big.', 'A day full of smiles. Share that energy with the people around you.'],
    ],
    parts: {
      money: ['Money', [
        ['Watch out for impulse buys. Look at your cart again tomorrow.', 'Your wallet feels light. Start by checking the small expenses.', 'Money you lend today may be hard to get back.'],
        ["What comes in goes out. Stick to your plan and you're fine.", 'Save that long-debated purchase for the weekend.', 'Spare change adds up more than you think.'],
        ['A small windfall or a nice discount may come your way.', 'Something you saved finally proves useful.', 'A good day to talk money. Negotiations go well.']]],
      love: ['Love', [
        ['One careless word could be misread. Be the listener today.', "Don't bottle up hurt feelings. Mention them lightly.", 'A little time alone actually protects your relationships.'],
        ['A calm, cozy day. Sharing a meal is plenty.', 'Check in on an old friend.', 'Keeping small promises builds big trust.'],
        ['If your eyes meet, smile first. Good things follow.', 'A good day to confess or make up.', "Someone you haven't heard from reaches out first."]]],
      health: ['Health', [
        ['Fatigue builds up easily. Get to bed early tonight.', 'Loosen up your neck and shoulders often.', 'Warm soup beats cold food today.'],
        ["Drink water often and you'll feel lighter.", 'A short walk is the perfect reset.', 'Long screen time tires your eyes. Look into the distance now and then.'],
        ['You feel light today. A good time to start that workout.', 'A good night\'s sleep makes for a fresh day.', 'Your favorite food recharges you.']]],
      work: ['Work & study', [
        ['A day for care. Double-check numbers and dates.', "Don't carry it all alone. Ask for help.", 'Big decisions can wait a day.'],
        ['Take things one step at a time and nothing gets stuck.', 'Notes from meetings or class will come in handy later.', 'Reviewing goes better than learning something new today.'],
        ['Your focus is sharp. Tackle the hardest task first.', 'Your ideas are well received today.', "What you've learned pays off right away."]]],
    },
    colors: ['Red', 'Orange', 'Yellow', 'Lime', 'Green', 'Sky blue', 'Blue', 'Purple', 'Pink', 'Brown', 'White', 'Black', 'Gold', 'Silver'],
    items: ['Handkerchief', 'Ballpoint pen', 'Warm tea', 'Earphones', 'Small notebook', 'Mirror', 'Umbrella', 'Chocolate', 'Ring', 'Hair tie', 'Scented hand cream', 'A single coin', 'A favorite song', 'Sneakers', 'A photo', 'Keychain', 'Bookmark', 'Mandarin orange'],
    dirs: ['East', 'West', 'South', 'North', 'Southeast', 'Southwest', 'Northeast', 'Northwest'],
    times: ['Early morning', 'Morning', 'Around noon', 'Afternoon', 'Sunset', 'Evening', 'Late night'],
    words: ["Slow is fine, as long as you don't stop.", "Today's small kindness becomes tomorrow's big luck.", "If you don't know the way, ask as you go.", 'Fall asleep thinking of one thing you did well.', 'Done comes before perfect.', 'Luck comes to a smiling face.', 'After the rain, the ground grows firm.', 'Cherish what you love one more time today.', 'Starting is half; the other half is keeping at it.', 'The more you hurry, the more you need one deep breath.', 'Good things gather around good people.', 'One step beyond yesterday is enough.', 'Open your ears and the path appears.', 'A little tidying makes a lot of room.', 'The seed you plant today will bloom someday.', 'Say a word of thanks to someone who deserves it.', "Get one thing you don't want to do out of the way first.", "It's okay to go at your own pace.", 'Mistakes are practice for next time.', 'A hearty meal is the best medicine.'],
    animal: [
      ["A day it's okay to slow down", 'A day when fewer words win', 'A day when tidying shows the way'],
      ['A smooth, easy day', 'A day of small joys', 'A day to keep your promises'],
      ['A day for good news', 'A day your hands move fast', 'A lucky day for people'],
      ['A day full of energy', 'A day everything goes right', 'A day worth taking a chance'],
    ],
  },
};
const COLOR_HEX = ['#e5484d', '#f76b15', '#ffc53d', '#8db654', '#30a46c', '#3e9bd8', '#3e63dd', '#8e4ec6', '#e93d82', '#a07553', '#f4f4f2', '#2b2b2b', '#d4a72c', '#b8bcc6'];
const PART_ICON = { money: '💰', love: '💗', health: '🍀', work: '📚' };
const PART_IDS = ['money', 'love', 'health', 'work'];
const ko = TEXT.ko;

function bucket5(score) { return score < 40 ? 0 : score < 60 ? 1 : score < 75 ? 2 : score < 90 ? 3 : 4; }
function bucket3(score) { return score < 45 ? 0 : score < 72 ? 1 : 2; }
/** 점수 1~100: 가운데가 많고 양끝이 드물게 */
function score(r) { return Math.max(1, Math.min(100, Math.round(((r() + r() + r()) / 3) * 100 + 8))); }
const L = (lang) => TEXT[lang] ?? ko;

/** 생년월일(YYYY-MM-DD)과 날짜로 오늘의 운세. 언어가 달라도 고르는 번호는 같다 */
export function fortune(birth, date, lang = 'ko') {
  const t = L(lang);
  const r = rng(`${date}|${birth}`);
  const total = score(r);
  const b5 = bucket5(total), ti = idx(r, ko.total[b5].length);
  const parts = PART_IDS.map((id) => {
    const s = Math.max(1, Math.min(100, Math.round(total * 0.5 + score(r) * 0.5)));
    const b = bucket3(s), k = idx(r, ko.parts[id][1][b].length);
    return { id, label: t.parts[id][0], icon: PART_ICON[id], score: s, text: t.parts[id][1][b][k] };
  });
  const c = idx(r, COLOR_HEX.length);
  const nums = new Set();
  while (nums.size < 2) nums.add(1 + Math.floor(r() * 45));
  return {
    date, birth, total, stars: Math.max(1, Math.round(total / 20)),
    text: t.total[b5][ti], parts,
    color: { name: t.colors[c], hex: COLOR_HEX[c] }, numbers: [...nums].sort((a, b) => a - b),
    item: t.items[idx(r, ko.items.length)], dir: t.dirs[idx(r, ko.dirs.length)], time: t.times[idx(r, ko.times.length)], word: t.words[idx(r, ko.words.length)],
  };
}

/** 띠별 오늘의 한 줄 (12개) */
export function animalsToday(date, lang = 'ko') {
  const t = L(lang);
  return ANIMALS.map((a) => {
    const r = rng(`${date}|animal|${a.id}`);
    const s = score(r);
    const b = s < 45 ? 0 : s < 62 ? 1 : s < 80 ? 2 : 3;
    const k = idx(r, ko.animal[b].length), c = idx(r, COLOR_HEX.length);
    return { id: a.id, ...animalLabel(a, lang), score: s, stars: Math.max(1, Math.round(s / 20)), text: t.animal[b][k], color: t.colors[c], number: 1 + Math.floor(r() * 9) };
  });
}

/** "1994-03-15" 이 맞는 생년월일인지 */
export function validBirth(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return false;
  const y = +m[1], mo = +m[2], d = +m[3];
  const dt = new Date(y, mo - 1, d);
  return y >= 1900 && y <= 2100 && dt.getMonth() === mo - 1 && dt.getDate() === d;
}

/** 브라우저 언어 목록에서 고르기 (없으면 영어) */
export function pickLang(prefs) {
  for (const p of prefs || []) {
    const b = String(p).toLowerCase().split('-')[0];
    if (LANGS.includes(b)) return b;
  }
  return 'en';
}
