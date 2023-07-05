export async function getSVG(path: string) {
  return await fetch(path).then(r=> r.text()).catch(err => "wrong svg path");
}