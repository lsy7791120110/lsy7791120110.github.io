window.PUBLIC_PROFILE = {
  "name": "이소연",
  "englishName": "Soyeon Lee",
  "updated": "2026-10-30",
  "master": {
    "school": "서울대학교 대학원",
    "department": "약학과 · 약화학전공",
    "degree": "약학석사",
    "field": "의약화학 연구",
    "period": "2024.03 – 2026.02",
    "gpa": "4.00 / 4.3"
  },
  "bachelor": {
    "school": "동국대학교",
    "department": "화학과 · 교직과정 이수",
    "degree": "이학사",
    "period": "2020.03 – 2024.02",
    "gpa": "4.38 / 4.5",
    "honor": "최우등졸업"
  },
  "research": [
    {
      "id": "nucleoside",
      "type": "research",
      "tag": "석사학위 연구",
      "period": "2024.03 – 2025.09",
      "title": "2',2'-Difluoro Carbocyclic Nucleoside",
      "subtitle": "뉴클레오사이드 유도체 합성",
      "description": "Nucleobase coupling 수율을 10%에서 35%로 높이고, 최종 유도체 10종의 구조를 확인했습니다.",
      "metric": "10종",
      "metricLabel": "최종 유도체 합성 및 구조 확인",
      "sections": [
        {
          "title": "연구 목표",
          "body": "Gemcitabine의 구조적 특징에 착안해 두 불소 치환기를 유지하면서 고리 내 산소를 탄소로 대체한 carbocyclic nucleoside 유도체를 합성했습니다. D-ribose에서 출발해 adenine, guanine, cytosine, uracil 계열 유도체 10종을 확보했습니다."
        },
        {
          "title": "결합 반응의 조건 검토",
          "items": [
            "NaH/DMF와 NaH/DMSO에서 목표 생성물을 얻지 못해 유사한 합성 사례를 문헌에서 찾았습니다.",
            "18-crown-6를 도입한 NaH 조건에서 10% 수율로 생성물을 확보했습니다.",
            "18-crown-6 첨가 조건에서 염기를 비교했습니다. Cs2CO3에서 25%, K2CO3에서 35% 수율을 확인하고 K2CO3/18-crown-6 조건을 후속 합성에 적용했습니다."
          ]
        },
        {
          "title": "분석과 결과 정리",
          "body": "1H, 13C, 19F NMR을 직접 측정하고 해석했으며, 외부에 의뢰한 HRMS의 계산값과 측정값을 대조해 구조를 확인했습니다. 실험 절차와 수율, 구조 분석 및 외부 평가 결과를 영문 학위논문으로 정리했습니다."
        },
        {
          "title": "항암 활성 평가 결과",
          "body": "외부 연구실에서 9종을 6종의 사람 암세포주에 평가했습니다. IC50은 모두 20 μM을 초과했습니다. 랩미팅에서는 관련 문헌을 근거로 항바이러스 평가를 제안했습니다."
        }
      ],
      "scope": "직접 수행: 문헌 검토, 유도체 합성, NMR 측정·해석, MS 결과 대조, 학위논문 및 포스터 작성. 생물학적 평가는 외부 연구실에서 수행했습니다."
    },
    {
      "id": "a2a",
      "type": "research",
      "tag": "공동연구",
      "period": "2025.01 – 2025.09",
      "title": "A2A Adenosine Receptor",
      "subtitle": "C2 aryl 유도체 합성과 수용체 결합 평가",
      "description": "유도체 10종을 합성했습니다. 외부 결합평가에서 phenyl(13a)과 meta-cyano(13h) 유도체는 10 μM에서 hA2AAR 결합 억제율 90%를 보였습니다.",
      "metric": "90%",
      "metricLabel": "13a·13h의 hA2AAR 결합 억제율 · 10 μM",
      "sections": [
        {
          "title": "합성과 구조 확인",
          "body": "공동연구자와 합성 대상을 정하고, Suzuki coupling과 보호기 제거로 C2 aryl 유도체 10종을 합성했습니다. ortho·para methyl 치환체를 다시 합성하고 phenyl 유도체를 추가했습니다. 직접 측정한 NMR과 외부 LRMS 결과로 구조를 확인했습니다."
        },
        {
          "title": "치환기에 따른 평가 결과",
          "body": "Methyl 치환체의 억제율은 meta(13b) 77%, para(13e) 68%, ortho(13d) 50%였습니다. 같은 meta 위치에서도 cyano(13h)는 90%, formyl(13c)은 45%로 차이가 있었습니다. 이 결과만으로 치환기의 전자적 성질과 결합력의 관계를 단정하지 않았습니다."
        },
        {
          "title": "결과 정리",
          "body": "각 화합물의 구조와 A1, A2A, A2B, A3 수용체 평가 결과를 표로 정리해 공동연구자에게 전달했습니다."
        }
      ],
      "scope": "유도체 합성과 구조 확인, 결과 정리를 담당했습니다. Binding assay는 외부 기관에서 수행했습니다.",
      "binding": {
        "concentration": "10 μM",
        "target": "hA2AAR",
        "metric": "Binding inhibition (%)",
        "rows": [
          {
            "compound": "13a",
            "substituent": "phenyl",
            "inhibition": 90
          },
          {
            "compound": "13h",
            "substituent": "meta-cyano",
            "inhibition": 90
          },
          {
            "compound": "13b",
            "substituent": "meta-methyl",
            "inhibition": 77
          },
          {
            "compound": "13e",
            "substituent": "para-methyl",
            "inhibition": 68
          },
          {
            "compound": "13d",
            "substituent": "ortho-methyl",
            "inhibition": 50
          },
          {
            "compound": "13c",
            "substituent": "meta-formyl",
            "inhibition": 45
          }
        ]
      }
    },
    {
      "id": "heterocycle",
      "type": "research",
      "tag": "학부연구생",
      "period": "2021.12 – 2022.12",
      "title": "Heterocyclic Compound Library",
      "subtitle": "헤테로고리 기반 저분자 라이브러리",
      "description": "약물성 저분자 화합물 약 50종을 합성하고, 21종의 조건과 분석 결과를 졸업논문에 수록했습니다.",
      "metric": "약 50종",
      "metricLabel": "학부 연구 전체 합성 화합물",
      "sections": [
        {
          "title": "연구 내용",
          "body": "동국대학교 혁신신약라이브러리 연구센터에서 학부연구생으로 참여했습니다. 1,3,4-thiadiazole 및 1,2,4-oxadiazole 유도체 등 약물성 헤테로고리 저분자 라이브러리의 합성과 분석을 수행했습니다."
        },
        {
          "title": "합성과 분석",
          "body": "TLC로 반응 진행을 확인하고 column chromatography 및 MPLC로 생성물을 정제했습니다. 1H NMR과 LC-MS 자료를 대조해 구조를 확인하고, 불순물이나 잔류 용매가 확인되면 재정제했습니다."
        },
        {
          "title": "결과 기록",
          "body": "학부 연구에서 합성한 약 50종 중 21종의 합성 조건과 분석 결과를 졸업논문에 정리했습니다."
        }
      ],
      "scope": "직접 수행: 유도체 합성, 정제, 분석자료 검토, 실험 기록 및 졸업논문 작성."
    },
    {
      "id": "ai",
      "type": "digital",
      "tag": "생성형 AI · 교육 업무",
      "period": "2025.12 – 2026.12",
      "title": "수업 자료와 성적 관리",
      "subtitle": "문항 DB · PDF→HWPX 변환 · 성적표",
      "description": "생성형 AI로 문항 DB, PDF→HWPX 변환 도구, Excel 성적표를 제작했습니다. 수업자료 편집과 매주 주간테스트의 성적 관리에 사용합니다.",
      "metric": "300종 이상",
      "metricLabel": "생성형 AI를 활용한 교재용 그림 제작",
      "sections": [
        {
          "title": "문항 관리와 문서 작업",
          "body": "문항을 유형별로 분류해 학생별 연습자료를 구성하는 DB와, 시험지 PDF를 편집 가능한 HWPX로 변환하는 도구를 제작했습니다."
        },
        {
          "title": "성적 입력과 채점 관리",
          "body": "성적 입력을 편하게 하고 같은 기준으로 채점하려고 Excel 성적표 도구를 만들었습니다. 성적과 정답률을 정리하고 학생별 성적표를 출력하며, 매주 주간테스트에 사용하고 있습니다."
        },
        {
          "title": "교재와 시각 자료",
          "body": "100페이지 이상 교재의 오류와 교육과정 범위 이탈 여부를 검토하는 데 생성형 AI를 활용했습니다. 교재용 그림 300종 이상과 한글 템플릿, 표지 디자인을 제작하고 개념과 풀이의 시각화에 활용했습니다."
        },
        {
          "title": "도구 제작 과정",
          "body": "수업에서 필요한 기능을 정해 AI에 요청하고, 결과를 확인하며 수정했습니다. 실제 성적 입력과 자료 제작에 써 보고 불편한 부분을 고쳤습니다."
        }
      ],
      "scope": "필요한 기능을 정하고 AI로 도구를 제작·수정했으며, 수업과 자료 제작에 사용했습니다."
    }
  ],
  "jobs": [
    {
      "organization": "미래탐구 목동 중등센터",
      "role": "과학 전임강사",
      "period": "2025.12 – 2026.12",
      "description": "중등 과학 수업과 수업자료 제작, 성적 및 정답률 관리. 생성형 AI를 활용한 교재·문항 DB·업무 도구 제작."
    },
    {
      "organization": "대림우등생학원",
      "role": "과학 강사",
      "period": "2022.12 – 2023.12",
      "description": "중학교 1·2·3학년 과학 수업."
    },
    {
      "organization": "중앙스카이학원",
      "role": "과학 강사",
      "period": "2022.03 – 2023.03",
      "description": "중학교 3학년, 고등학교 1·2학년 과학 수업."
    }
  ],
  "volunteer": {
    "total": "107시간",
    "label": "공식 인정 봉사시간",
    "items": [
      "동국대 사범대학 교육봉사 도반 · 30시간",
      "동국대 참사람봉사단(2022) · 34시간",
      "동국대 참사람봉사단(2023) · 42시간"
    ]
  },
  "mentoring": {
    "total": "456시간",
    "label": "교육멘토링 활동시간",
    "items": [
      "KT 랜선야학 4·5·6기 · 256시간",
      "The 가꿈 7기 · 100시간",
      "시립창동청소년센터 동행멘토링 · 100시간"
    ]
  },
  "credentials": [
    "중등학교 정교사 2급(화학) · 2024.02",
    "컴퓨터활용능력 2급 · 2021.07",
    "OPIc IH · 2026.08"
  ],
  "honors": [
    "동국대학교 최우등졸업 · 2024.02",
    "동국대학교 학기우등생 7회 · 2020–2023"
  ],
  "poster": {
    "title": "2025년 제20회 약품화학분과학회 하계워크숍",
    "date": "2025.06.25",
    "role": "주저자 · 포스터 발표",
    "topic": "2',2'-Difluoro carbocyclic nucleoside 유도체 연구"
  },
  "otherActivities": [
    "동국대학교 화학과 학생회 총무 · 2022.03–2023.02",
    "손짓사랑회 수화동아리 교육부장 · 2020.09–2021.12",
    "오리온 대학생 소비자 패널 · 2021.02–2021.12"
  ],
  "training": [
    "Schrödinger 기초과정 · 2025.02 · 6시간",
    "Gaussian DFT 계산 · 계산화학 수업 실습",
    "제약바이오 품질실무 · 2021.08 · 14시간"
  ]
};
