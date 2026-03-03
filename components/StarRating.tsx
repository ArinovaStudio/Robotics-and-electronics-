export default function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <span
            key={star}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              fill="#e0e0e0"
              className="text-[#e0e0e0] absolute inset-0"
            />
            {filled || half ? (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : "50%" }}
              >
                <Star size={size} fill="#f0b31e" className="text-[#f0b31e]" />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}