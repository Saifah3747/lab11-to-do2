import { useState, useRef } from 'react'
import { Trash2, Plus, Check } from 'lucide-react'

const PRIORITY = {
  low:    { label: 'ต่ำ',  cls: 'bg-emerald-100 text-emerald-700', dot: '#10b981' },
  medium: { label: 'กลาง', cls: 'bg-amber-100 text-amber-700',     dot: '#f59e0b' },
  high:   { label: 'สูง',  cls: 'bg-red-100 text-red-700',         dot: '#ef4444' },
}
const ORDER = ['low', 'medium', 'high']
const FILTERS = [['all', 'ทั้งหมด'], ['active', 'ยังไม่เสร็จ'], ['completed', 'เสร็จแล้ว']]

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'ตัวอย่าง: ส่งรายงานประจำสัปดาห์', done: false, priority: 'high' },
    { id: 2, text: 'ดับเบิลคลิกเพื่อแก้ไขข้อความ', done: false, priority: 'medium' },
    { id: 3, text: 'ติ๊กเพื่อทำเครื่องหมายว่าเสร็จ', done: true, priority: 'low' },
  ])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [editId, setEditId] = useState(null)
  const [editText, setEditText] = useState('')
  const [removing, setRemoving] = useState([])
  const nextId = useRef(4)

  const add = () => {
    const t = text.trim()
    if (!t) return
    setTodos([{ id: nextId.current++, text: t, done: false, priority }, ...todos])
    setText('')
  }
  const toggle = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const cycle = (id) => setTodos(todos.map(t => t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t))
  const remove = (id) => {
    setRemoving(r => [...r, id])
    setTimeout(() => {
      setTodos(ts => ts.filter(t => t.id !== id))
      setRemoving(r => r.filter(x => x !== id))
    }, 250)
  }
  const startEdit = (t) => { setEditId(t.id); setEditText(t.text) }
  const saveEdit = () => {
    const v = editText.trim()
    if (v) setTodos(todos.map(t => t.id === editId ? { ...t, text: v } : t))
    setEditId(null)
  }
  const clearDone = () => todos.filter(t => t.done).forEach(t => remove(t.id))

  const remaining = todos.filter(t => !t.done).length
  const doneCount = todos.length - remaining
  const shown = todos.filter(t => filter === 'all' ? true : filter === 'active' ? !t.done : t.done)

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-1">สิ่งที่ต้องทำ</h1>
      <p className="muted text-sm mb-6">จัดการงานของคุณให้เป็นระเบียบ</p>

      <div className="card rounded-2xl p-3 sm:p-4 mb-4">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="เพิ่มงานใหม่..."
            className="inp flex-1 min-w-0 rounded-xl px-3 py-2.5 text-base"
          />
          <button onClick={add} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-3 sm:px-4 flex items-center gap-1.5 font-medium transition-colors">
            <Plus size={18} /> <span className="hidden sm:inline">เพิ่ม</span>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="muted text-sm">ความสำคัญ:</span>
          {ORDER.map(p => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`text-xs px-3 py-1 rounded-full font-medium border-2 transition ${PRIORITY[p].cls}`}
              style={{ borderColor: priority === p ? PRIORITY[p].dot : 'transparent', opacity: priority === p ? 1 : .6 }}
            >
              {PRIORITY[p].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl mb-4 card">
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${filter === k ? 'bg-indigo-500 text-white' : 'muted hover:opacity-80'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        {shown.length === 0 && (
          <div className="card rounded-2xl p-8 text-center muted text-sm">
            {filter === 'completed' ? 'ยังไม่มีงานที่เสร็จ' : filter === 'active' ? 'ไม่มีงานค้างแล้ว 🎉' : 'ยังไม่มีงาน เพิ่มงานแรกของคุณได้เลย'}
          </div>
        )}
        {shown.map(t => (
          <div key={t.id} className={`item overflow-hidden ${removing.includes(t.id) ? 'removing' : 'mb-2.5'}`}>
            <div className="card rounded-2xl px-3 py-3 flex items-center gap-3">
              <button
                onClick={() => toggle(t.id)}
                aria-label="เสร็จแล้ว"
                className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${t.done ? 'bg-indigo-500 border-indigo-500 text-white' : ''}`}
                style={t.done ? {} : { borderColor: 'var(--line)' }}
              >
                {t.done && <Check size={14} />}
              </button>
              <div className="flex-1 min-w-0">
                {editId === t.id ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditId(null) }}
                    className="inp w-full rounded-lg px-2 py-1 text-base"
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEdit(t)}
                    title="ดับเบิลคลิกเพื่อแก้ไข"
                    className={`block break-words cursor-text select-none ${t.done ? 'line-through muted' : ''}`}
                  >
                    {t.text}
                  </span>
                )}
              </div>
              <button
                onClick={() => cycle(t.id)}
                title="เปลี่ยนความสำคัญ"
                className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${PRIORITY[t.priority].cls}`}
              >
                {PRIORITY[t.priority].label}
              </button>
              <button onClick={() => remove(t.id)} aria-label="ลบ" className="shrink-0 muted hover:text-red-500 transition-colors p-1">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="muted">เหลืออีก {remaining} งาน</span>
        <button
          onClick={clearDone}
          disabled={doneCount === 0}
          className="text-red-500 disabled:opacity-30 disabled:cursor-not-allowed hover:underline"
        >
          ล้างงานที่เสร็จแล้ว{doneCount > 0 ? ` (${doneCount})` : ''}
        </button>
      </div>
    </div>
  )
}
