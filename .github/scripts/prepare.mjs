import fs from 'node:fs'
import path from 'node:path'

const summary = fs.readFileSync('SUMMARY.md','utf8')
const ROOT   = '.'
fs.mkdirSync(path.join(ROOT,'.vitepress'),{recursive:true})

function touch(mdPath){
  fs.mkdirSync(path.dirname(mdPath),{recursive:true})
  if (!fs.existsSync(mdPath)) fs.writeFileSync(mdPath,'# \n\n内容待补充。\n')
}

/* ===== 生成可折叠 sidebar ===== */
const sidebar = []
let stack     = [{ children: sidebar, level: -1 }] // 栈顶父节点
const r       = /^(\s*)-\s+\[([^\]]+)\]\(([^)]+)\)/gm
let m

while ((m = r.exec(summary)) !== null) {
  const [, sp, text, file] = m
  const level = sp.length / 2
  const url   = '/' + file.replace(/\.md$/,'')

  // 找到父节点
  while (level <= stack.at(-1).level) stack.pop()
  const parent = stack.at(-1)

  // 一级目录 → 折叠对象；子项直接 push
  const node =
    level === 0
      ? { text, items: [{ text, link: url }], collapsed: true } // 默认折叠
      : { text, link: url }

  parent.children.push(node)

  // 预留子级挂载点
  if (level === 0) {
    node.items = node.items || []
    stack.push({ children: node.items, level })
  } else {
    stack.push({ children: parent.children, level })
  }

  touch(path.join(ROOT, file))
}
/* ================================= */

// frontmatter 处理同上
function walk(dir){
  for (const f of fs.readdirSync(dir)){
    const full = path.join(dir,f)
    if (fs.statSync(full).isDirectory()){ walk(full); continue }
    if (!f.endsWith('.md')) continue
    const cnt = fs.readFileSync(full,'utf8')
    if (!cnt.trimStart().startsWith('---'))
      fs.writeFileSync(full, `---\n---\n${cnt}`)
  }
}
walk(ROOT)

fs.writeFileSync(path.join(ROOT,'.vitepress','sidebar.mjs'),
  `export default ${JSON.stringify(sidebar,null,2)}`)
