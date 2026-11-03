import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Category, Counts } from "../types";
import { localizeDigits, number } from "../utils/date";

export function CategoryCard({
  category,
  counts,
  index,
  onEdit,
  onDelete,
}: {
  category: Category;
  counts: Counts;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const total = category.items.reduce(
    (sum, item) => sum + (counts[item.id]?.total ?? 0),
    0,
  );
  const groups = new Map<string, number>();
  for (const item of category.items) {
    if (item.group)
      groups.set(
        item.group,
        (groups.get(item.group) ?? 0) + (counts[item.id]?.total ?? 0),
      );
  }
  return (
    <article className={`category-card card-tone-${index % 4}`}>
      <div className="category-card-top">
        <div className="category-card-identity">
          <span className={`category-mark mark-${index % 4}`}>
            {number(index + 1)}
          </span>
          <span className="category-card-label">အမျိုးအစား</span>
        </div>
        <div className="category-card-actions">
          <button
            className="icon-button"
            onClick={onEdit}
            aria-label={`${category.name} ပြင်မည်`}
            title="ပြင်မည်"
          >
            <Pencil size={17} />
          </button>
          <button
            className="icon-button"
            onClick={onDelete}
            aria-label={`${category.name} ဖျက်မည်`}
            title="ဖျက်၍ မရပါ"
            disabled
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
      <Link to={`/category/${category.id}`} className="category-link">
        <h2 className="category-title">{localizeDigits(category.name)}</h2>
        <span className="category-arrow">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="category-meta">
        <span>
          စာသား <strong>{number(category.items.length)} <small>မျိုး</small></strong>
        </span>
        <span>
          စုစုပေါင်း <strong>{number(total)} <small>ကြိမ်</small></strong>
        </span>
      </div>
      {groups.size > 0 && (
        <div className="category-groups">
          {Array.from(groups, ([group, count]) => (
            <div key={group}>
              <span>{localizeDigits(group)}</span>
              <strong>{number(count)} ကြိမ်</strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
