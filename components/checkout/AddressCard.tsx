import { Edit, Trash2 } from "lucide-react";

export function AddressCard({ addr, selectedId, onSelect, onEdit, onDelete }: any) {
  return (
    <div 
      onClick={() => onSelect(addr.id)}
      className={`border rounded-lg p-6 cursor-pointer transition-colors relative group ${selectedId === addr.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => onEdit(e, addr)}
          className="p-2 text-gray-500 hover:text-[#f0b31e] bg-white border border-gray-200 rounded-md shadow-sm hover:border-[#f0b31e] transition-colors"
          title="Edit Address"
        >
          <Edit size={16} />
        </button>
        <button 
          onClick={(e) => onDelete(e, addr.id)}
          className="p-2 text-gray-500 hover:text-red-500 bg-white border border-gray-200 rounded-md shadow-sm hover:border-red-500 transition-colors"
          title="Delete Address"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="radio"
          checked={selectedId === addr.id}
          onChange={() => onSelect(addr.id)}
          className="mt-1.5 w-4 h-4 cursor-pointer accent-[#f0b31e]"
        />
        <div className="flex-1 pr-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-gray-800">{addr.name}</span>
            <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-semibold">{addr.type}</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            {addr.addressLine1}
            {addr.addressLine2 && `, ${addr.addressLine2}`}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            {addr.city}, {addr.state} - {addr.pincode}
          </p>
          <p className="text-sm text-gray-600">Mobile: <span className="font-semibold">{addr.phone}</span></p>
          {addr.isDefault && (
            <p className="text-sm text-gray-600 mt-3">• Pay on Delivery available</p>
          )}
        </div>
      </div>
    </div>
  );
}