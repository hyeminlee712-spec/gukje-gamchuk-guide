// 주소 끝에 붙는 추적용 값(utm_…, trk, ref 등)을 지워 같은 문서를 같은 주소로 다루게 한다.
// 서버·화면 어느 쪽에서든 쓸 수 있는 순수 함수라 비밀 값이 없다.
export function cleanUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    for (const key of [...url.searchParams.keys()]) {
      // OC는 법제처 API 인증값이 들어가는 자리라 어떤 경우에도 지운다
      if (/^(utm_|trk|ref$|fbclid|gclid|oc$|disable-tracking)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    url.hash = "";
    // 끝의 "/" 하나만 다른 경우를 같은 주소로 본다
    const text = url.toString();
    return text.endsWith("/") && url.pathname !== "/" ? text.slice(0, -1) : text;
  } catch {
    return rawUrl;
  }
}
