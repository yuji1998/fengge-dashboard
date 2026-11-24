/* vocab_transforms.js — 中考词形变换题库（动态维护）
 * 中考招牌题型「用所给单词的适当形式填空」，主流背单词 App 基本不做。
 * 结构：window.VOCAB_TRANSFORMS = { 词根: { mean, items:[{q挖空句, a正确形式, zh中文, tip考点}] } }
 * 进度记在独立 key「tf|词根」上，走与单词相同的记忆曲线，互不干扰。
 * 数据仅存本机；加载失败时词形变换功能自动降级，不影响核心背诵。
 */
window.VOCAB_TRANSFORMS = {
"care":{mean:"关心；照料",items:[
  {q:"Be _____ when you cross the street.",a:"careful",zh:"过马路时要小心。",tip:"be 动词后接形容词"},
  {q:"He was _____ and made many mistakes.",a:"careless",zh:"他很粗心，犯了很多错。",tip:"形容词·粗心的"},
  {q:"She finished the work _____.",a:"carefully",zh:"她仔细地完成了工作。",tip:"修饰动词用副词"}]},
"success":{mean:"成功",items:[
  {q:"Hard work leads to _____.",a:"success",zh:"努力带来成功。",tip:"to 后接名词"},
  {q:"He _____ in passing the exam.",a:"succeeded",zh:"他成功通过了考试。",tip:"动词过去式"},
  {q:"She is a _____ businesswoman.",a:"successful",zh:"她是位成功的女商人。",tip:"修饰名词用形容词"}]},
"health":{mean:"健康",items:[
  {q:"Exercise is good for your _____.",a:"health",zh:"运动对你的健康有益。",tip:"介词后接名词"},
  {q:"Eat _____ to keep fit.",a:"healthily",zh:"健康饮食以保持身材。",tip:"修饰动词用副词"},
  {q:"He looks _____ today.",a:"healthy",zh:"他今天看起来很健康。",tip:"look 后接形容词"}]},
"friend":{mean:"朋友",items:[
  {q:"Our teacher is very _____ to us.",a:"friendly",zh:"老师对我们很友好。",tip:"be 后接形容词"},
  {q:"They built a strong _____.",a:"friendship",zh:"他们建立了深厚的友谊。",tip:"形容词变名词"}]},
"invent":{mean:"发明",items:[
  {q:"Edison _____ the light bulb.",a:"invented",zh:"爱迪生发明了电灯。",tip:"动词过去式"},
  {q:"The _____ is very useful.",a:"invention",zh:"这项发明很有用。",tip:"冠词后接名词"},
  {q:"He is a famous _____.",a:"inventor",zh:"他是位著名的发明家。",tip:"表示人的名词"}]},
"science":{mean:"科学",items:[
  {q:"She wants to be a _____.",a:"scientist",zh:"她想成为科学家。",tip:"表示人的名词"},
  {q:"We study _____ knowledge.",a:"scientific",zh:"我们学习科学知识。",tip:"修饰名词用形容词"}]},
"art":{mean:"艺术",items:[
  {q:"He is a great _____.",a:"artist",zh:"他是位伟大的艺术家。",tip:"表示人的名词"},
  {q:"The room has an _____ design.",a:"artistic",zh:"这房间有艺术性的设计。",tip:"修饰名词用形容词"}]},
"music":{mean:"音乐",items:[
  {q:"She is a famous _____.",a:"musician",zh:"她是位著名的音乐家。",tip:"表示人的名词"},
  {q:"He plays a _____ instrument.",a:"musical",zh:"他演奏一种乐器。",tip:"修饰名词用形容词"}]},
"teach":{mean:"教",items:[
  {q:"My mother is a _____.",a:"teacher",zh:"我妈妈是位老师。",tip:"表示人的名词"},
  {q:"She has been _____ for ten years.",a:"teaching",zh:"她教书十年了。",tip:"现在完成时持续"}]},
"manage":{mean:"管理",items:[
  {q:"He is the _____ of the company.",a:"manager",zh:"他是公司经理。",tip:"表示人的名词"},
  {q:"Good _____ is important.",a:"management",zh:"良好的管理很重要。",tip:"形容词/冠词后接名词"}]},
"develop":{mean:"发展",items:[
  {q:"The city has seen rapid _____.",a:"development",zh:"这座城市发展迅速。",tip:"形容词后接名词"},
  {q:"This is a _____ country.",a:"developing",zh:"这是发展中国家。",tip:"现在分词作形容词"}]},
"decide":{mean:"决定",items:[
  {q:"He made a big _____.",a:"decision",zh:"他做了重大决定。",tip:"make a 后接名词"},
  {q:"We _____ to go there yesterday.",a:"decided",zh:"我们昨天决定去那里。",tip:"动词过去式"}]},
"describe":{mean:"描述",items:[
  {q:"Can you give a _____ of him?",a:"description",zh:"你能描述一下他吗？",tip:"冠词后接名词"}]},
"discuss":{mean:"讨论",items:[
  {q:"We had a _____ about the plan.",a:"discussion",zh:"我们讨论了那个计划。",tip:"冠词后接名词"}]},
"encourage":{mean:"鼓励",items:[
  {q:"His words gave me great _____.",a:"encouragement",zh:"他的话给了我很大鼓励。",tip:"形容词后接名词"},
  {q:"My teacher often _____ me.",a:"encourages",zh:"老师经常鼓励我。",tip:"第三人称单数"}]},
"improve":{mean:"改进",items:[
  {q:"Reading can _____ your English.",a:"improve",zh:"阅读能提高你的英语。",tip:"情态动词后接原形"},
  {q:"There is a great _____ in his work.",a:"improvement",zh:"他的工作大有进步。",tip:"冠词后接名词"}]},
"introduce":{mean:"介绍",items:[
  {q:"Let me _____ myself.",a:"introduce",zh:"让我介绍一下自己。",tip:"let 后接动词原形"},
  {q:"He gave a brief _____.",a:"introduction",zh:"他作了简短介绍。",tip:"冠词后接名词"}]},
"celebrate":{mean:"庆祝",items:[
  {q:"The _____ was wonderful.",a:"celebration",zh:"庆典很精彩。",tip:"冠词后接名词"}]},
"communicate":{mean:"交流",items:[
  {q:"Good _____ is important in a team.",a:"communication",zh:"良好的沟通在团队中很重要。",tip:"形容词后接名词"}]},
"connect":{mean:"连接",items:[
  {q:"There is a close _____ between them.",a:"connection",zh:"它们之间有密切联系。",tip:"冠词后接名词"}]},
"consider":{mean:"考虑",items:[
  {q:"We should take it into _____.",a:"consideration",zh:"我们应予以考虑。",tip:"介词后接名词"}]},
"educate":{mean:"教育",items:[
  {q:"_____ is very important.",a:"Education",zh:"教育非常重要。",tip:"句首作主语用名词"},
  {q:"This is an _____ program.",a:"educational",zh:"这是个教育类节目。",tip:"修饰名词用形容词"}]},
"express":{mean:"表达",items:[
  {q:"He showed his thanks with a smile as an _____.",a:"expression",zh:"他用微笑表达感谢。",tip:"冠词后接名词"}]},
"fail":{mean:"失败",items:[
  {q:"Failure is the mother of success — never _____.",a:"fail",zh:"失败是成功之母——永不言弃。",tip:"祈使句用原形"},
  {q:"He _____ the exam last week.",a:"failed",zh:"他上周考试不及格。",tip:"动词过去式"}]},
"imagine":{mean:"想象",items:[
  {q:"She has a rich _____.",a:"imagination",zh:"她想象力丰富。",tip:"形容词后接名词"}]},
"impress":{mean:"使印象深刻",items:[
  {q:"The show left a deep _____ on us.",a:"impression",zh:"演出给我们留下深刻印象。",tip:"冠词后接名词"},
  {q:"The view was _____.",a:"impressive",zh:"景色令人印象深刻。",tip:"be 后接形容词"}]},
"invite":{mean:"邀请",items:[
  {q:"He received an _____ yesterday.",a:"invitation",zh:"他昨天收到一份邀请。",tip:"冠词后接名词"},
  {q:"They _____ me to the party.",a:"invited",zh:"他们邀请我参加聚会。",tip:"动词过去式"}]},
"organize":{mean:"组织",items:[
  {q:"The _____ was well planned.",a:"organization",zh:"这次活动组织得很好。",tip:"冠词后接名词"},
  {q:"She is an _____ person.",a:"organized",zh:"她是个有条理的人。",tip:"修饰名词用形容词"}]},
"perform":{mean:"表演",items:[
  {q:"The _____ was excellent.",a:"performance",zh:"演出非常精彩。",tip:"冠词后接名词"},
  {q:"He is a famous _____.",a:"performer",zh:"他是著名演员。",tip:"表示人的名词"}]},
"protect":{mean:"保护",items:[
  {q:"We should care about environmental _____.",a:"protection",zh:"我们应关注环境保护。",tip:"形容词后接名词"}]},
"suggest":{mean:"建议",items:[
  {q:"Can you give me a _____?",a:"suggestion",zh:"你能给我个建议吗？",tip:"冠词后接名词"},
  {q:"I _____ going by train.",a:"suggest",zh:"我建议坐火车去。",tip:"主语后用原形"}]},
"translate":{mean:"翻译",items:[
  {q:"He is a _____.",a:"translator",zh:"他是位翻译家。",tip:"表示人的名词"},
  {q:"This is a good _____.",a:"translation",zh:"这是个好译文。",tip:"冠词后接名词"}]},
"value":{mean:"价值",items:[
  {q:"This book is very _____.",a:"valuable",zh:"这本书很有价值。",tip:"be 后接形容词"}]},
"wonder":{mean:"惊奇",items:[
  {q:"What a _____ view!",a:"wonderful",zh:"多美的景色！",tip:"冠词后接形容词"},
  {q:"She smiled _____.",a:"wonderfully",zh:"她笑容灿烂。",tip:"修饰动词用副词"}]},
"honest":{mean:"诚实",items:[
  {q:"_____ is the best policy.",a:"Honesty",zh:"诚实为上策。",tip:"句首作主语用名词"},
  {q:"He is an _____ boy.",a:"honest",zh:"他是个诚实的男孩。",tip:"修饰名词用形容词"}]},
"kind":{mean:"善良",items:[
  {q:"Thank you for your _____.",a:"kindness",zh:"谢谢你的好意。",tip:"介词后接名词"},
  {q:"She spoke _____ to the child.",a:"kindly",zh:"她和蔼地对孩子说话。",tip:"修饰动词用副词"}]},
"lucky":{mean:"幸运",items:[
  {q:"He is very _____.",a:"lucky",zh:"他很幸运。",tip:"be 后接形容词"},
  {q:"_____, we caught the bus.",a:"Luckily",zh:"幸运的是，我们赶上了车。",tip:"句首副词修饰整句"}]},
"patient":{mean:"耐心",items:[
  {q:"A teacher needs _____.",a:"patience",zh:"老师需要耐心。",tip:"动词后接名词"},
  {q:"He waited _____ for the result.",a:"patiently",zh:"他耐心等待结果。",tip:"修饰动词用副词"}]},
"real":{mean:"真实",items:[
  {q:"Tell me the _____ reason.",a:"real",zh:"告诉我真正的原因。",tip:"修饰名词用形容词"},
  {q:"I _____ don't know.",a:"really",zh:"我真的不知道。",tip:"修饰动词用副词"}]},
"safe":{mean:"安全",items:[
  {q:"They arrived home _____.",a:"safely",zh:"他们安全到家。",tip:"修饰动词用副词"},
  {q:"Safety comes first — think of _____.",a:"safety",zh:"安全第一——想想安全。",tip:"介词后接名词"}]},
"true":{mean:"真实",items:[
  {q:"Tell me the _____.",a:"truth",zh:"告诉我真相。",tip:"冠词后接名词"},
  {q:"I _____ believe you.",a:"truly",zh:"我真心相信你。",tip:"修饰动词用副词"}]},
"able":{mean:"能够",items:[
  {q:"He has the _____ to do it.",a:"ability",zh:"他有能力做这件事。",tip:"冠词后接名词"},
  {q:"He was _____ to swim at five.",a:"able",zh:"他五岁就会游泳。",tip:"be able to 固定搭配"}]},
"active":{mean:"积极",items:[
  {q:"She takes part in class _____.",a:"activities",zh:"她参加课堂活动。",tip:"名词复数"},
  {q:"He is _____ in class.",a:"active",zh:"他在课堂上很积极。",tip:"be 后接形容词"}]},
"easy":{mean:"容易",items:[
  {q:"He finished the work _____.",a:"easily",zh:"他轻松完成了工作。",tip:"修饰动词用副词"}]},
"final":{mean:"最后",items:[
  {q:"_____, we won the game.",a:"Finally",zh:"最后，我们赢了比赛。",tip:"句首副词修饰整句"}]},
"happy":{mean:"快乐",items:[
  {q:"Wish you _____!",a:"happiness",zh:"祝你幸福！",tip:"动词后接名词"},
  {q:"The children played _____.",a:"happily",zh:"孩子们玩得很开心。",tip:"修饰动词用副词"}]},
"heavy":{mean:"重",items:[
  {q:"It was raining _____.",a:"heavily",zh:"雨下得很大。",tip:"修饰动词用副词"}]},
"polite":{mean:"礼貌",items:[
  {q:"He spoke _____ to the old man.",a:"politely",zh:"他礼貌地对老人说话。",tip:"修饰动词用副词"},
  {q:"It is _____ to shout at others.",a:"impolite",zh:"对别人大喊是不礼貌的。",tip:"否定前缀 im-"}]},
"possible":{mean:"可能",items:[
  {q:"It is _____ to finish in time.",a:"possible",zh:"及时完成是可能的。",tip:"be 后接形容词"},
  {q:"It is _____ for us to finish today.",a:"impossible",zh:"我们今天完成是不可能的。",tip:"否定前缀 im-"}]},
"quick":{mean:"快",items:[
  {q:"He ran _____ to the station.",a:"quickly",zh:"他飞快地跑向车站。",tip:"修饰动词用副词"}]},
"recent":{mean:"最近",items:[
  {q:"I _____ bought a new book.",a:"recently",zh:"我最近买了本新书。",tip:"修饰动词用副词"}]},
"serious":{mean:"严肃",items:[
  {q:"Think _____ before you act.",a:"seriously",zh:"行动前认真考虑。",tip:"修饰动词用副词"}]},
"sudden":{mean:"突然",items:[
  {q:"_____, it began to rain.",a:"Suddenly",zh:"突然下起雨来。",tip:"句首副词修饰整句"}]},
"usual":{mean:"通常",items:[
  {q:"He _____ gets up at six.",a:"usually",zh:"他通常六点起床。",tip:"修饰动词用副词"},
  {q:"This is an _____ result.",a:"unusual",zh:"这是个不寻常的结果。",tip:"否定前缀 un-"}]},
"wide":{mean:"宽",items:[
  {q:"English is _____ used.",a:"widely",zh:"英语被广泛使用。",tip:"修饰动词用副词"},
  {q:"What is the _____ of the river?",a:"width",zh:"这条河有多宽？",tip:"冠词后接名词"}]},
"strong":{mean:"强壮",items:[
  {q:"He has great _____.",a:"strength",zh:"他力气很大。",tip:"形容词后接名词"},
  {q:"We should work _____.",a:"strongly",zh:"我们应努力奋斗。",tip:"修饰动词用副词"}]},
"please":{mean:"使高兴",items:[
  {q:"It gives me great _____.",a:"pleasure",zh:"这给我很大乐趣。",tip:"形容词后接名词"},
  {q:"I am _____ with the result.",a:"pleased",zh:"我对结果很满意。",tip:"be 后接形容词(人)"},
  {q:"We had a _____ evening.",a:"pleasant",zh:"我们度过了愉快的夜晚。",tip:"修饰物用形容词"}]},
"surprise":{mean:"使惊讶",items:[
  {q:"I was _____ at the news.",a:"surprised",zh:"我对这消息感到惊讶。",tip:"修饰人用 -ed"},
  {q:"The news was _____.",a:"surprising",zh:"这消息令人惊讶。",tip:"修饰物用 -ing"}]},
"excite":{mean:"使兴奋",items:[
  {q:"The children were _____.",a:"excited",zh:"孩子们很兴奋。",tip:"修饰人用 -ed"},
  {q:"It was an _____ game.",a:"exciting",zh:"那是场激动人心的比赛。",tip:"修饰物用 -ing"}]},
"interest":{mean:"使感兴趣",items:[
  {q:"I am _____ in English.",a:"interested",zh:"我对英语感兴趣。",tip:"be interested in 固定搭配"},
  {q:"This is an _____ book.",a:"interesting",zh:"这是本有趣的书。",tip:"修饰物用 -ing"}]},
"bore":{mean:"使厌烦",items:[
  {q:"I felt _____ during the long talk.",a:"bored",zh:"冗长的讲话中我感到无聊。",tip:"修饰人用 -ed"},
  {q:"The movie was _____.",a:"boring",zh:"这电影很无聊。",tip:"修饰物用 -ing"}]},
"tire":{mean:"使疲惫",items:[
  {q:"I was _____ after the trip.",a:"tired",zh:"旅行后我很累。",tip:"修饰人用 -ed"},
  {q:"The work was _____.",a:"tiring",zh:"这工作很累人。",tip:"修饰物用 -ing"}]},
"relax":{mean:"放松",items:[
  {q:"I felt _____ after the holiday.",a:"relaxed",zh:"假期后我感到放松。",tip:"修饰人用 -ed"},
  {q:"It was a _____ afternoon.",a:"relaxing",zh:"那是个令人放松的下午。",tip:"修饰物用 -ing"}]},
"worry":{mean:"担心",items:[
  {q:"She was _____ about her son.",a:"worried",zh:"她为儿子担心。",tip:"be worried about 固定搭配"}]},
"confident":{mean:"自信",items:[
  {q:"He has great _____.",a:"confidence",zh:"他很有信心。",tip:"形容词后接名词"},
  {q:"She spoke _____.",a:"confidently",zh:"她自信地讲话。",tip:"修饰动词用副词"}]},
"energy":{mean:"能量",items:[
  {q:"He is an _____ boy.",a:"energetic",zh:"他是个精力充沛的男孩。",tip:"修饰名词用形容词"}]},
"danger":{mean:"危险",items:[
  {q:"It is _____ to swim here.",a:"dangerous",zh:"在这里游泳很危险。",tip:"be 后接形容词"},
  {q:"The animal is in _____.",a:"danger",zh:"这只动物有危险。",tip:"介词后接名词"}]},
"difference":{mean:"不同",items:[
  {q:"Can you tell the _____?",a:"difference",zh:"你能说出区别吗？",tip:"冠词后接名词"},
  {q:"The two books are _____.",a:"different",zh:"这两本书不同。",tip:"be 后接形容词"}]},
"importance":{mean:"重要",items:[
  {q:"Health is _____.",a:"important",zh:"健康很重要。",tip:"be 后接形容词"},
  {q:"He knows the _____ of English.",a:"importance",zh:"他知道英语的重要性。",tip:"冠词后接名词"}]},
"wind":{mean:"风",items:[
  {q:"It is a _____ day.",a:"windy",zh:"今天有风。",tip:"修饰名词用形容词"}]},
"rain":{mean:"雨",items:[
  {q:"It is a _____ day.",a:"rainy",zh:"今天下雨。",tip:"修饰名词用形容词"}]},
"sun":{mean:"太阳",items:[
  {q:"It is a _____ day.",a:"sunny",zh:"今天是晴天。",tip:"修饰名词用形容词"}]},
"snow":{mean:"雪",items:[
  {q:"It is a _____ day.",a:"snowy",zh:"今天下雪。",tip:"修饰名词用形容词"}]},
"cloud":{mean:"云",items:[
  {q:"It is a _____ day.",a:"cloudy",zh:"今天多云。",tip:"修饰名词用形容词"}]},
"noise":{mean:"噪音",items:[
  {q:"Don't be _____ in class.",a:"noisy",zh:"上课别吵闹。",tip:"be 后接形容词"},
  {q:"They talked _____.",a:"noisily",zh:"他们吵闹地交谈。",tip:"修饰动词用副词"}]},
"careful":{mean:"细心",items:[
  {q:"He does his homework _____.",a:"carefully",zh:"他认真做作业。",tip:"修饰动词用副词"}]},
};
