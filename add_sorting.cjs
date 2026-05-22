const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add sortBy state
code = code.replace(
  'const [filter, setFilter] = useState<string>("all");',
  'const [filter, setFilter] = useState<string>("all");\n  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "status-asc" | "status-desc">("date-desc");'
);

// Update filteredInquiries
const originalFiltered = `  const filteredInquiries = useMemo(() => {
    if (filter === "all") return inquiries;
    return inquiries.filter(i => i.status === filter);
  }, [inquiries, filter]);`;

const newFiltered = `  const filteredInquiries = useMemo(() => {
    let result = filter === "all" ? [...inquiries] : inquiries.filter(i => i.status === filter);
    result.sort((a, b) => {
      // CreatedAt is formatted as localized string. We should ideally parse it back? 
      // Wait, in Firebase it's a ToDate().toLocaleString(). 
      // Actually to sort date properly, we should use the string as best effort or raw createdAt.
      // Wait, we need to make sure createdAt can be sorted. Let's see what is inside 'inquiries'.
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();

      if (sortBy === "date-desc") {
        return timeB - timeA;
      }
      if (sortBy === "date-asc") {
        return timeA - timeB;
      }
      if (sortBy === "status-asc") {
        return (a.status || "").localeCompare(b.status || "");
      }
      if (sortBy === "status-desc") {
        return (b.status || "").localeCompare(a.status || "");
      }
      return 0;
    });
    return result;
  }, [inquiries, filter, sortBy]);`;

code = code.replace(originalFiltered, newFiltered);

const originalHTML = `<div className="flex bg-white p-2 rounded-[2rem] shadow-sm ">
                <div className="px-6 py-3 border-r ">
                    <p className="text-[10px] font-black text-brand-charcoal uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xl font-display text-brand-charcoal">{inquiries.length}</p>
                </div>
                <div className="px-6 py-3">
                    <p className="text-[10px] font-black text-brand-charcoal uppercase tracking-widest mb-1">New Today</p>
                    <p className="text-xl font-display text-brand-pink">
                      {inquiries.filter(i => i.status === 'new').length}
                    </p>
                </div>
              </div>`;

const sortDropdown = `              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-2 rounded-[2rem] shadow-sm ">
                <div className="flex">
                  <div className="px-6 py-3 border-r border-brand-charcoal/10">
                      <p className="text-[10px] font-black text-brand-charcoal uppercase tracking-widest mb-1">Total</p>
                      <p className="text-xl font-display text-brand-charcoal">{inquiries.length}</p>
                  </div>
                  <div className="px-6 py-3">
                      <p className="text-[10px] font-black text-brand-charcoal uppercase tracking-widest mb-1">New</p>
                      <p className="text-xl font-display text-brand-pink">
                        {inquiries.filter(i => i.status === 'new').length}
                      </p>
                  </div>
                </div>
                <div className="px-4 border-l border-brand-charcoal/10">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-brand-cream/50 px-4 py-2 rounded-xl text-sm font-bold text-brand-charcoal outline-none border cursor-pointer border-transparent focus:border-brand-pink transition-all"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="status-asc">Status (A-Z)</option>
                    <option value="status-desc">Status (Z-A)</option>
                  </select>
                </div>
              </div>`;

code = code.replace(originalHTML, sortDropdown);

fs.writeFileSync('src/App.tsx', code);
console.log('Sorting added.');
