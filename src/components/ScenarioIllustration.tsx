import React, { useState } from 'react';

// Real photographic assets generated for each drill scenario
import img1A from '../assets/images/drill_office_freeze_1791742573575.jpg';
import img1B from '../assets/images/drill_visitor_barrier_1791742583051.jpg';
import img2A from '../assets/images/drill_prayer_room_1791742592439.jpg';
import img2B from '../assets/images/drill_restroom_locked_1791742602480.jpg';
import img3A from '../assets/images/drill_hallway_cpr_1791742611079.jpg';
import img3B from '../assets/images/drill_archive_debris_1791742619883.jpg';
import img4A from '../assets/images/drill_stairwell_refuge_1791742629310.jpg';
import img4B from '../assets/images/drill_headphones_alert_1791742638697.jpg';
import img5A from '../assets/images/drill_server_fire_1791742646938.jpg';

interface ScenarioIllustrationProps {
  scenarioId: string;
  className?: string;
  altText?: string;
}

const SCENARIO_IMAGES: Record<string, { src: string; caption: string; badge: string }> = {
  "1A": {
    src: img1A,
    caption: "Colleague frozen in shock at desk during active alarm",
    badge: "SCENARIO 1A · OPEN OFFICE"
  },
  "1B": {
    src: img1B,
    caption: "International visitor confused by emergency PA broadcast",
    badge: "SCENARIO 1B · VISITOR AREA"
  },
  "2A": {
    src: img2A,
    caption: "Colleagues in prayer with smoke entering from hallway",
    badge: "SCENARIO 2A · PRAYER ROOM"
  },
  "2B": {
    src: img2B,
    caption: "Restroom with smoke entering and one stall locked from inside",
    badge: "SCENARIO 2B · RESTROOMS"
  },
  "3A": {
    src: img3A,
    caption: "Colleague collapsed in hallway near wall-mounted AED",
    badge: "SCENARIO 3A · MEDICAL EVENT"
  },
  "3B": {
    src: img3B,
    caption: "Severely damaged archive room with fallen structural beam",
    badge: "SCENARIO 3B · STRUCTURAL TRAUMA"
  },
  "4A": {
    src: img4A,
    caption: "Wheelchair user at fire stairwell with elevators shut down",
    badge: "SCENARIO 4A · STAIRWELL REFUGE"
  },
  "4B": {
    src: img4B,
    caption: "Colleague wearing noise-cancelling headphones with broken strobe",
    badge: "SCENARIO 4B · SENSORY ALERT"
  },
  "5A": {
    src: img5A,
    caption: "Small trashbin fire vs large ceiling-high server room blaze",
    badge: "SCENARIO 5A · FIRE BOUNDARY"
  }
};

export const ScenarioIllustration: React.FC<ScenarioIllustrationProps> = ({ 
  scenarioId, 
  className = "",
  altText
}) => {
  const [hasError, setHasError] = useState(false);
  const data = SCENARIO_IMAGES[scenarioId] || SCENARIO_IMAGES["1A"];

  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shadow-md ${className}`}>
      {!hasError ? (
        <>
          <img
            src={data.src}
            alt={altText || data.caption}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover object-center select-none"
            loading="eager"
          />
          {/* Subtle gradient scrim at bottom to elevate caption */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />
          
          {/* Top metadata badge */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono font-bold text-amber-300">
            {data.badge}
          </div>

          {/* Bottom informative caption */}
          <div className="absolute bottom-2 left-2.5 right-2.5 text-[11px] font-medium text-slate-200 truncate drop-shadow-md">
            {data.caption}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 text-slate-400 text-center">
          <div className="text-2xl mb-1">📸</div>
          <div className="text-xs font-bold text-slate-200">{data.caption}</div>
          <div className="text-[10px] text-amber-400 mt-1 font-mono">{data.badge}</div>
        </div>
      )}
    </div>
  );
};
