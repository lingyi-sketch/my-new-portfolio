export const profile = {
  name: 'Ling',
  tagline: '생성형 AI로 다시 쓰는 영화',
  intro:
    '생성형 AI로 영화적 콘텐츠를 만들고, 그 가능성과 한계를 탐구한다.',
  bio: '이미지, 영상, 지면(페이지) 세 가지 매체를 오가며 생성형 AI가 만들어내는 장면과 서사를 기록합니다. 완벽하지 않은 프레임, 어긋난 연속성, 예측 불가능한 디테일 속에서 새로운 영화적 언어를 찾는 것이 작업의 출발점입니다.',
  email: 'xianglingyi528@gmail.com',
}

export const categories = [
  { key: 'images', label: 'Images', path: '/' },
  { key: 'videos', label: 'Videos', path: '/videos' },
  { key: 'pages', label: 'Pages', path: '/pages' },
  { key: 'profile', label: 'Profile', path: '/profile' },
]

export const works = [
  // Videos — 예시 데이터 (실제 파일은 아직 없음 → 카드에 자리표시)
  {
    id: 'videos-01',
    category: 'videos',
    index: '01',
    title: '재구성된 시퀀스',
    englishTitle: 'Reconstructed Sequence',
    year: '2024',
    image: '/images/video-01-reconstructed-sequence.jpg',
    summary: '기존 영화의 한 장면을 생성형 AI로 다시 촬영한 3분짜리 습작.',
    description:
      '고전 영화의 유명한 장면 하나를 골라, 동일한 대사와 동선을 생성형 AI 영상 모델로 다시 만들었다. 원작과 다른 지점들이 오히려 영화적 문법에 대해 질문을 던진다.',
  },
  {
    id: 'videos-02',
    category: 'videos',
    index: '02',
    title: '다시 쓰는 엔딩',
    englishTitle: 'Rewriting the Ending',
    year: '2024',
    image: '/images/video-02-rewriting-the-ending.jpg',
    summary: '결말이 알려진 이야기에 대안적 엔딩을 생성한 단편 실험.',
    description:
      '잘 알려진 이야기의 결말 직전 장면부터 생성형 AI가 이어받아 새로운 엔딩을 만들도록 했다. 서사의 관성과 모델의 상상력이 부딪히는 지점을 기록했다.',
  },
  {
    id: 'videos-03',
    category: 'videos',
    index: '03',
    title: '가상의 프레임',
    englishTitle: 'Imaginary Frames',
    year: '2023',
    image: '/images/video-03-imaginary-frames.jpg',
    summary: '존재하지 않는 영화의 예고편을 만드는 프로젝트.',
    description:
      '시놉시스만 존재하는 가상의 영화를 위해 예고편을 생성했다. 실제로 촬영된 적 없는 장면들이 어떻게 "영화처럼" 느껴지는지를 탐구한다.',
  },

  // Pages — 예시 데이터 (실제 파일은 아직 없음 → 카드에 자리표시)
  {
    id: 'pages-01',
    category: 'pages',
    index: '01',
    title: '지면 위의 시나리오',
    englishTitle: 'Screenplay on Paper',
    year: '2024',
    image: '/images/pages-01-screenplay-on-paper.jpg',
    summary: '생성형 AI가 쓴 시나리오를 에디토리얼 지면으로 구성한 작업.',
    description:
      '생성형 AI로 작성한 짧은 시나리오를 잡지 화보 형식의 지면으로 편집했다. 텍스트와 이미지가 병치되며 새로운 읽기 방식을 제안한다.',
  },
  {
    id: 'pages-02',
    category: 'pages',
    index: '02',
    title: '프레임 밖의 이야기',
    englishTitle: 'Beyond the Frame',
    year: '2023',
    image: '/images/pages-02-beyond-the-frame.jpg',
    summary: '영화의 컷과 컷 사이, 보이지 않는 순간을 지면에 기록.',
    description:
      '편집되어 사라진 장면들을 생성형 AI로 복원해 지면 위에 배치했다. 본편에는 없는, 그러나 있었을지도 모르는 순간들.',
  },
  {
    id: 'pages-03',
    category: 'pages',
    index: '03',
    title: '가상의 인터뷰',
    englishTitle: 'Imaginary Interview',
    year: '2023',
    image: '/images/pages-03-imaginary-interview.jpg',
    summary: '가상의 감독과 나눈 인터뷰 형식의 텍스트 작업.',
    description:
      '생성형 AI가 연기한 가상의 영화감독과 나눈 인터뷰를 지면으로 구성했다. 질문과 답 사이에서 창작 주체에 대한 질문이 남는다.',
  },
]

export function getWorksByCategory(category) {
  return works.filter((work) => work.category === category)
}

export function getWorkById(id) {
  return works.find((work) => work.id === id)
}
