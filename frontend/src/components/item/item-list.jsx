import ItemCard from "./item-card"

export default function ItemList({ items }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-600">No items found</h3>
        <p className="mt-2 text-gray-500">Try adjusting your filters to find what you're looking for.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {items.map((item) => (
        <ItemCard key={item._id} item={item} />
      ))}
    </div>
  )
}
