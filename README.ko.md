<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/taste-skill-wordmark-dark.png" />
    <img src="assets/taste-skill-wordmark.png" alt="Taste Skill" width="340" />
  </picture>
</p>

<p align="center">
  <a href="https://tasteskill.dev" title="tasteskill.dev 방문"><img src="https://img.shields.io/badge/website-tasteskill.dev-24292f?style=flat" alt="tasteskill.dev 방문" /></a>
  &nbsp;
  <a href="https://tastecode.dev" title="tastecode.dev 방문"><img src="https://img.shields.io/badge/new-TasteCode-ff6b00?style=flat" alt="새로운 소식: TasteCode" /></a>
  &nbsp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-24292f?style=flat&amp;logo=github&amp;logoColor=white" alt="MIT 라이선스" /></a>
  &nbsp;
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-view-24292f?style=flat" alt="변경 기록" /></a>
</p>

<p align="center">
  <a href="https://tastecode.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/readme-tastecode-dark.webp" />
      <img src="assets/readme-tastecode.webp" alt="TasteCode가 출시되었습니다. 디자인 에이전트를 내장한 Taste Skill 데스크톱 앱입니다. 무료 오픈 소스이며, tastecode.dev에서 다운로드할 수 있습니다." width="100%" />
    </picture>
  </a>
</p>

<h3 align="center">후원사</h3>

<table align="center">
  <tr>
    <td align="center" width="104">
      <a href="https://interfaces.dev/?utm_source=tasteskill&utm_medium=sponsorship">
        <img src="assets/sponsors/interfaces-dev-icon.webp" alt="Interfaces" width="52" height="52" />
      </a>
    </td>
    <td><sub><a href="https://interfaces.dev/?utm_source=tasteskill&utm_medium=sponsorship"><strong>interfaces.dev</strong></a> · 디자인 엔지니어링 매거진 · 제작: <a href="https://github.com/jakubkrehel"><strong>Jakub Krehel</strong></a></sub></td>
  </tr>
  <tr>
    <td align="center" width="104">
      <a href="https://reactbits.dev">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="assets/sponsors/reactbits-icon-dark.svg" />
          <img src="assets/sponsors/reactbits-icon-light.svg" alt="React Bits" width="52" height="52" />
        </picture>
      </a>
    </td>
    <td><sub><a href="https://reactbits.dev"><strong>React Bits</strong></a> · 창의적인 인터페이스를 위한 React 애니메이션 컴포넌트</sub></td>
  </tr>
  <tr>
    <td align="center" width="104"><a href="https://img.ly/"><img src="assets/sponsors/imgly-logo.svg" alt="IMG.LY" width="52" height="52" /></a></td>
    <td><sub><a href="https://img.ly/"><strong>IMG.LY</strong></a> · CreativeEditor SDK</sub></td>
  </tr>
  <tr>
    <td align="center" width="104"><a href="https://www.sent.dm"><img src="assets/sponsors/sentdm.png" alt="Sent.dm" width="52" height="52" /></a></td>
    <td><sub><a href="https://www.sent.dm"><strong>Sent.dm</strong></a> · SMS, WhatsApp, RCS용 메시징 API</sub></td>
  </tr>
</table>

<p align="center"><sub><a href="https://github.com/sponsors/Leonxlnx">후원하기</a></sub></p>

**Taste Skill**은 코딩 에이전트가 흔한 랜딩 페이지를 조립하는 데 그치지 않고 웹사이트와 앱 화면을 직접 디자인하도록 돕는 에이전트 스킬입니다. 아트 디렉션과 실제 사진을 제공하고, 실제 브라우저에서 작업 결과를 스스로 확인할 수 있게 합니다.

다음은 각각 하나의 디자인 브리프(목표·대상·조건을 정리한 작업 문서)로 제작한 페이지입니다.

<table>
  <tr>
    <td width="50%"><img src="examples/v2/coffee-storefront.webp" alt="직접 그린 매장 외관을 첫 화면의 핵심 영역에 배치한 커피숍 페이지" /></td>
    <td width="50%"><img src="examples/v2/night-dates.webp" alt="아카이브 사진에 행사 날짜를 배치한 테크노 공연 페이지" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="examples/v2/coffee-roast.webp" alt="사진 네 장으로 로스팅을 보여주는 커피숍 페이지 섹션" /></td>
    <td width="50%"><img src="examples/v2/coffee-questions.webp" alt="인덱스 카드를 쌓은 형태로 질문을 보여주는 커피숍 페이지" /></td>
  </tr>
</table>

사진은 공개 아카이브에서 찾은 실제 사진이며, 스킬이 출처를 표시합니다([출처 정보](examples/v2/CREDITS.md)). [출시 영상](https://github.com/Leonxlnx/taste-skill/releases/tag/v2.0.0)도 확인해 보세요.

## 설치

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

위 명령은 [`npx skills`](https://github.com/vercel-labs/agent-skills) CLI로 스킬을 설치합니다.

이 스킬의 스크립트는 **Node 22 이상**과 설치된 **Chrome, Edge 또는 Chromium**을 사용합니다. 별도의 구성 요소를 설치하지 않으며 API 키도 필요하지 않습니다. 이미지를 검색하려면 네트워크 연결이 필요합니다.

<details>
<summary>Claude Code 플러그인</summary>

다음 명령을 Claude Code 안에서 실행하세요. 이 스킬은 `taste-skill:` 네임스페이스를 사용하므로 다른 스킬과 이름이 충돌하지 않습니다.

```
/plugin marketplace add Leonxlnx/taste-skill
/plugin install taste-skill@taste-skill
```

나중에 `/plugin update`로 업데이트할 수 있습니다.

</details>

<details>
<summary>Codex 플러그인</summary>

```bash
codex plugin marketplace add Leonxlnx/taste-skill
codex plugin add taste-skill@taste-skill
```

설치 후 새 Codex 세션을 시작하면 스킬이 로드됩니다.

</details>

<details>
<summary>복제한 저장소에서 복사 대신 링크로 설치</summary>

`./install.sh`는 스킬을 Claude Code에 심볼릭 링크로 연결합니다. Codex에는 `--codex`, 두 에이전트 모두에는 `--all-agents`를 사용하세요. 링크로 연결되므로 `git pull`을 실행하면 설치된 스킬도 함께 업데이트됩니다.

</details>

이미 설치했다면 설치 명령을 다시 실행하세요. 설치 이름은 바뀌지 않았습니다. 이전 스킬을 찾고 있다면 [다른 저장소로 이동한 스킬](#다른-저장소로-이동한-스킬)을 확인하세요.

## v2 작동 방식

이 스킬은 엄선된 사이트 247개를 연구해 만들었습니다. 구현은 다음 여섯 단계로 진행됩니다.

1. 브리프를 읽고 클라이언트만의 고유한 소재를 정리합니다.
2. 스크립트가 연구를 바탕으로 정리한 디자인 방향 20가지 중 3가지를 제시하면, 에이전트가 하나를 고릅니다.
3. 클라이언트 고유의 소재와 선택한 방향을 연결하는 핵심 아이디어를 한 문장으로 정리합니다.
4. 공개 컬렉션의 실제 사진과 영상을 사용해 구현하고 출처를 표시합니다.
5. 실제 브라우저에서 세 가지 너비로 페이지를 검사하고, 상투적이거나 완성도가 낮은 구성이 있으면 불합격 처리합니다.
6. 직접 스크린샷을 살펴보고 가장 큰 문제 세 가지를 수정하는 과정을 최대 세 차례 반복합니다.

구현에는 약 30–45분과 수십만 토큰이 필요합니다. 자세한 내용은 [변경 기록](CHANGELOG.md)과 [연구 자료](skills/taste-skill/references/research.md)를 참고하세요.

대시보드와 앱 화면은 v2.1부터 별도의 절차를 따릅니다. 실제 제품 화면을 연구해 정리한 앱 스타일 중 하나를 제시하고, 그 스타일의 수치 기준에 맞춰 화면의 기본 틀, 데이터, 차트, 표를 구현합니다. 결과물은 앱 전용 규칙으로 검사합니다. 절제된 패널, 가지런히 정렬된 수치, 데이터 표현에 집중한 색상, 내비게이션을 접을 수 있는 모바일 레이아웃이 그 기준입니다. 제품 랜딩 페이지에 등장하는 앱 화면도 같은 방식으로 구현하므로, 스크린샷이 실제로 작동하는 제품처럼 보입니다.

v2.1은 모든 페이지의 전체 구성도 검사합니다. 첫 화면의 명확한 제목, 균등한 여백, 한쪽으로 치우치지 않은 섹션, 이유 없이 길게 비어 있지 않은 구성이 기준입니다. 또한 최근 Awwwards Sites of the Day 선정작 100개를 분석해, 뛰어난 수상작에서 볼 수 있는 움직임을 구현합니다.

## 다른 저장소로 이동한 스킬

이 저장소에는 `design-taste-frontend` 스킬 하나가 있습니다. 나머지는 별도 저장소로 이동했으며 설치 이름은 그대로 유지됩니다.

| 설치 이름 | 현재 저장소 |
| --- | --- |
| `high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui`, `gpt-taste`, `stitch-design-taste`, `design-taste-frontend-v1`, `design-taste-frontend-v2-experimental` | **[Leonxlnx/taste-skill-classics](https://github.com/Leonxlnx/taste-skill-classics)** |
| `imagegen-frontend-web`, `imagegen-frontend-mobile`, `brandkit`, `image-to-code` | **[Leonxlnx/imagegen-skills](https://github.com/Leonxlnx/imagegen-skills)** |
| `redesign-existing-projects` | `design-taste-frontend`에 통합되었습니다. 기존 페이지를 수정하기 전에 실제 브라우저에서 먼저 점검합니다. |
| `full-output-enforcement` | 제거되었습니다. 같은 문제를 해결하려면 **[Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy)**를 참고하세요. |

이동한 스킬은 새 저장소에서 기존 이름 그대로 설치할 수 있습니다.

```bash
npx skills add https://github.com/Leonxlnx/taste-skill-classics --skill "high-end-visual-design"
```

## 자주 묻는 질문

**어떤 실행 환경이 필요한가요?**  
Node 22 이상과 Chrome, Edge 또는 Chromium이 필요합니다. 별도의 구성 요소를 설치하지 않으며 API 키도 사용하지 않습니다. 인터넷 연결은 이미지를 검색할 때만 필요합니다.

**이미지는 어디서 가져오며, 사용해도 되나요?**  
Wikimedia Commons, Openverse, the Met 등의 공개 컬렉션에서 가져옵니다. 퍼블릭 도메인, CC0, CC BY, CC BY-SA 파일만 제시하며, 스킬이 페이지에 출처를 표시합니다. 자체 이미지가 있다면 그 이미지로 교체하세요.

**React, Vue, Svelte, 일반 HTML에서도 사용할 수 있나요?**  
네. 특정 프레임워크가 아닌 디자인 자체에 관한 규칙이므로 사용할 수 있습니다.

**대시보드와 앱 화면에도 사용할 수 있나요?**  
v2.1부터 지원합니다. 이 스킬은 웹페이지와 앱 화면을 구분하며, 대시보드, 관리자 화면, 설정 화면에는 별도 절차를 적용합니다. 실제 제품 화면을 연구한 결과에서 스타일을 선택하고, 절제된 패널과 사실에 충실한 데이터 및 차트로 구성한 뒤, 전용 검사(`inspect.mjs --app`)를 수행합니다.

## 프로젝트 후원

Taste Skill이 도움이 되었다면 후원을 고려해 주세요.

[GitHub에서 후원하기](https://github.com/sponsors/Leonxlnx)

### 오픈 소스 지원사

<table align="center">
  <tr>
    <td align="center" width="104"><a href="https://www.kimi.com"><img src="assets/sponsors/kimi-icon.png" alt="Kimi" width="52" height="52" /></a></td>
    <td><a href="https://www.kimi.com"><picture><source media="(prefers-color-scheme: dark)" srcset="https://kimi-file.moonshot.cn/prod-chat-kimi/kfs/4/1/2026-06-05/1d8h69mt3v89kkekg24gg" /><img alt="Kimi Open Source Friends" src="https://kimi-file.moonshot.cn/prod-chat-kimi/kfs/4/1/2026-06-05/1d8h69fudcmosb3pipls0" height="42" /></picture></a><br /><sub><a href="https://platform.kimi.ai?track_id=track-20f0d64bcaba419bb425a3e8c306f65d&aff=taste-skill"><strong>Kimi API 키 발급받기</strong></a>: taste-skill 사용자는 첫 구매 시 API 크레딧을 10% 추가로 받습니다.</sub></td>
  </tr>
  <tr>
    <td align="center" width="104"><a href="https://vercel.com/open-source-program"><img src="assets/sponsors/vercel-logo.svg" alt="Vercel" width="52" height="52" /></a></td>
    <td><a href="https://vercel.com/open-source-program"><img src="assets/vercel-oss-program-badge.svg" alt="Vercel Open Source Program" height="28" /></a></td>
  </tr>
</table>

### 커뮤니티 후원자

<p>
<a href="https://github.com/dnakov"><img src="https://github.com/dnakov.png" width="40" height="40" style="border-radius:50%" alt="dnakov" title="dnakov" /></a>
<a href="https://github.com/AkramReshad"><img src="https://github.com/AkramReshad.png" width="40" height="40" style="border-radius:50%" alt="AkramReshad" title="AkramReshad" /></a>
<a href="https://github.com/ajmalaksar25"><img src="https://github.com/ajmalaksar25.png" width="40" height="40" style="border-radius:50%" alt="ajmalaksar25" title="ajmalaksar25" /></a>
<a href="https://github.com/krikkkk"><img src="https://github.com/krikkkk.png" width="40" height="40" style="border-radius:50%" alt="krikkkk" title="krikkkk" /></a>
<a href="https://github.com/navanchauhan"><img src="https://github.com/navanchauhan.png" width="40" height="40" style="border-radius:50%" alt="navanchauhan" title="navanchauhan" /></a>
<a href="https://github.com/robinebers"><img src="https://github.com/robinebers.png" width="40" height="40" style="border-radius:50%" alt="robinebers" title="robinebers" /></a>
<a href="https://github.com/JKc66"><img src="https://github.com/JKc66.png" width="40" height="40" style="border-radius:50%" alt="JKc66" title="JKc66" /></a>
<a href="https://github.com/u2393696078-rgb"><img src="https://github.com/u2393696078-rgb.png" width="40" height="40" style="border-radius:50%" alt="u2393696078-rgb" title="u2393696078-rgb" /></a>
<a href="https://github.com/a-human-created-this"><img src="https://github.com/a-human-created-this.png" width="40" height="40" style="border-radius:50%" alt="a-human-created-this" title="a-human-created-this" /></a>
<a href="https://github.com/AtharvaJaiswal005"><img src="https://github.com/AtharvaJaiswal005.png" width="40" height="40" style="border-radius:50%" alt="AtharvaJaiswal005" title="AtharvaJaiswal005" /></a>
<a href="https://github.com/ghughes7"><img src="https://github.com/ghughes7.png" width="40" height="40" style="border-radius:50%" alt="ghughes7" title="ghughes7" /></a>
<a href="https://github.com/mccun934"><img src="https://github.com/mccun934.png" width="40" height="40" style="border-radius:50%" alt="mccun934" title="mccun934" /></a>
<a href="https://github.com/techmedic5"><img src="https://github.com/techmedic5.png" width="40" height="40" style="border-radius:50%" alt="techmedic5" title="techmedic5" /></a>
<a href="https://github.com/bytewerk-dev"><img src="https://github.com/bytewerk-dev.png" width="40" height="40" style="border-radius:50%" alt="bytewerk-dev" title="bytewerk-dev" /></a>
<a href="https://github.com/LuisGot"><img src="https://github.com/LuisGot.png" width="40" height="40" style="border-radius:50%" alt="LuisGot" title="LuisGot" /></a>
<a href="https://github.com/oskar-collab"><img src="https://github.com/oskar-collab.png" width="40" height="40" style="border-radius:50%" alt="oskar-collab" title="oskar-collab" /></a>
<a href="https://github.com/denvit"><img src="https://github.com/denvit.png" width="40" height="40" style="border-radius:50%" alt="denvit" title="denvit" /></a>
<a href="https://github.com/onedollarstock"><img src="https://github.com/onedollarstock.png" width="40" height="40" style="border-radius:50%" alt="onedollarstock" title="onedollarstock" /></a>
<a href="https://github.com/KANA-33"><img src="https://github.com/KANA-33.png" width="40" height="40" style="border-radius:50%" alt="KANA-33" title="KANA-33" /></a>
<a href="https://github.com/emilkowalski"><img src="https://github.com/emilkowalski.png" width="40" height="40" style="border-radius:50%" alt="emilkowalski" title="emilkowalski" /></a>
<a href="https://github.com/AnthonyLiuVa"><img src="https://github.com/AnthonyLiuVa.png" width="40" height="40" style="border-radius:50%" alt="AnthonyLiuVa" title="AnthonyLiuVa" /></a>
<a href="https://github.com/Wolfy18"><img src="https://github.com/Wolfy18.png" width="40" height="40" style="border-radius:50%" alt="Wolfy18" title="Wolfy18" /></a>
<a href="https://github.com/Gigslol"><img src="https://github.com/Gigslol.png" width="40" height="40" style="border-radius:50%" alt="Gigslol" title="Gigslol" /></a>
</p>

<p align="center">
 <a href="https://www.star-history.com/leonxlnx/taste-skill">
  <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/badge?repo=Leonxlnx/taste-skill&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/badge?repo=Leonxlnx/taste-skill" />
   <img alt="GitHub 스타 순위 추이" src="https://api.star-history.com/badge?repo=Leonxlnx/taste-skill" />
  </picture>
 </a>
</p>

<sub>의견을 보내려면 이슈나 풀 리퀘스트를 만들거나, [@lexnlin](https://x.com/lexnlin) 또는 [@blueemi99](https://x.com/blueemi99)에게 DM을 보내거나, [hello@tasteskill.dev](mailto:hello@tasteskill.dev)로 이메일을 보내 주세요.</sub>

<sub>Taste Skill에는 공식 토큰, 코인, 암호화폐 프로젝트가 없습니다. 제 이름이나 이미지, 프로젝트를 사용하는 토큰은 저와 무관하며, 제가 지지하는 것도 아닙니다.</sub>

## 라이선스

[MIT 라이선스](LICENSE) · Copyright (c) 2026 Leonxlnx
