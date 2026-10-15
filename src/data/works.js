export const profile = {
  name: 'Ling',
  subtitle: '기록하고 싶은 순간, 그리고 담아내고 싶은 이야기',
  intro:
    '생성형 AI로 영화적 콘텐츠를 만들고, 그 가능성과 한계를 탐구한다.',
  bio: '이미지, 영상, 지면(페이지) 세 가지 매체를 오가며 생성형 AI가 만들어내는 장면과 서사를 기록합니다. 완벽하지 않은 프레임, 어긋난 연속성, 예측 불가능한 디테일 속에서 새로운 영화적 언어를 찾는 것이 작업의 출발점입니다.',
  aphorism:
    'Dare and the world always yields. If it beats you sometimes, dare it again and again and it will succumb.',
  contacts: [{ label: '', value: 'xianglingyi528@gmail.com' }],
  translations: {
    zh: {
      subtitle: '想要记录的瞬间，以及想要讲述的故事',
      intro: '用生成式 AI 创作电影感内容，探索它的可能与局限。',
      bio: '我在图像、影像、版面（页面）三种媒介之间往返，记录生成式 AI 创造出的场景与叙事。不完美的画面、错位的连续性、无法预料的细节，是我寻找新的电影语言的出发点。',
      aphorism: '敢于挑战，世界终会让步。即使偶尔被它击败，也要一次又一次地向它挑战，它终将屈服。',
    },
    en: {
      subtitle: 'The moments I want to record, and the stories I want to tell',
      intro: 'Making cinematic content with generative AI, and exploring its possibilities and limits.',
      bio: 'Moving between images, video, and printed pages, I document the scenes and stories that generative AI produces. Imperfect frames, broken continuity, and unpredictable details are where my search for a new cinematic language begins.',
    },
  },
}

export const PROFILE_TEXT_FIELDS = ['subtitle', 'intro', 'bio', 'aphorism']

export function pickProfileText(content, lang, field) {
  if (lang !== 'ko') {
    const translated = content.translations?.[lang]?.[field]
    if (translated) return translated
  }
  return content[field]
}

export const categories = [
  { key: 'profile', path: '/' },
  { key: 'video', path: '/video' },
  { key: 'script', path: '/script' },
  { key: 'game', path: '/game' },
  { key: 'assignments', path: '/assignments' },
]
