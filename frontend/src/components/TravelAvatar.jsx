const POSITIONS = {
    0: "0% 0%",
    1: "50% 0%",
    2: "100% 0%",
    3: "0% 50%",
    4: "50% 50%",
    5: "100% 50%",
    6: "0% 100%",
    7: "50% 100%",
    8: "100% 100%",
  };
  
  export default function TravelAvatar({
    src,
    index = 0,
    size = 56,
    ring = true,
  }) {
    return (
      <div
        className={`shrink-0 overflow-hidden rounded-full bg-white ${
          ring ? "ring-2 ring-white shadow-sm" : ""
        }`}
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${src})`,
          backgroundSize: "300% 300%",
          backgroundPosition: POSITIONS[index] || POSITIONS[0],
          backgroundRepeat: "no-repeat",
        }}
      />
    );
  }