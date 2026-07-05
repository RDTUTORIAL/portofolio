import { useEffect } from 'react';
import { SECRET_CONTENT, SECRET_UNLOCK_TARGET } from '../../data/secretContent';
import { useSecrets } from '../../context/SecretsContext';
import '../../styles/DraftRoomOverlay.scss';

const draftCards = [
    {
        title: 'Grade 6 Spark',
        tag: 'Origin',
        body: 'Coding started in grade 6, long before the work looked polished. That early curiosity became the base for more than seven years of informal software practice.'
    },
    {
        title: 'Private Experiments',
        tag: 'Drafts',
        body: 'Personal builds, private experiments, freelance attempts, and early brand work shaped the way Danis solves problems, even when the projects never became public.'
    },
    {
        title: 'Competition Pressure',
        tag: 'LKS & AI',
        body: 'LKS Web Technologies and government KA/AI competitions turned practice into pressure-tested execution at city and Bali province level.'
    },
    {
        title: 'Production Habits',
        tag: 'SMK Work',
        body: 'During SMK, client websites, company apps, academic systems, and nominated final-assignment projects made the work feel real and responsible.'
    }
];

const DraftRoomOverlay = () => {
    const {
        discoveredSecrets,
        secretCount,
        secretTotal,
        isBlueprintActive,
        isBlueprintUnlocked,
        isDraftRoomOpen,
        closeDraftRoom,
        toggleBlueprintMode,
    } = useSecrets();

    useEffect(() => {
        if (!isDraftRoomOpen) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') closeDraftRoom();
        };

        const previousOverflow = document.body.style.overflow;
        const previousOverscrollBehavior = document.body.style.overscrollBehavior;
        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'none';
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.overscrollBehavior = previousOverscrollBehavior;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isDraftRoomOpen, closeDraftRoom]);

    if (!isDraftRoomOpen) return null;

    const discoveredItems = discoveredSecrets
        .map((id) => SECRET_CONTENT[id])
        .filter(Boolean);

    const stopSceneInput = (event) => {
        event.stopPropagation();
    };

    return (
        <div
            className="draft-room-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="The Draft Room"
            onWheelCapture={stopSceneInput}
            onTouchStartCapture={stopSceneInput}
            onTouchMoveCapture={stopSceneInput}
            onPointerDownCapture={stopSceneInput}
            onPointerMoveCapture={stopSceneInput}
        >
            <button className="draft-room-backdrop" type="button" aria-label="Close The Draft Room" onClick={closeDraftRoom} />

            <section className="draft-room-panel">
                <div className="draft-room-header">
                    <div>
                        <span className="draft-room-kicker">Unlocked archive</span>
                        <h2>The Draft Room</h2>
                    </div>
                    <button className="draft-room-close" type="button" onClick={closeDraftRoom} aria-label="Close The Draft Room">
                        <svg viewBox="0 0 24 24">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="draft-room-hero">
                    <div className="draft-room-copy">
                        <p>
                            Danis is a developer from Badung whose main lane is web development, but the real story
                            is wider: AI, cybersecurity, IoT, software systems, and years of private builds that quietly
                            trained the craft before the polished work appeared.
                        </p>
                        <div className="draft-room-actions">
                            <button type="button" onClick={toggleBlueprintMode}>
                                {isBlueprintActive ? 'Exit Blueprint View' : 'Enter Blueprint View'}
                            </button>
                            <span>{secretCount}/{secretTotal} secrets found</span>
                        </div>
                    </div>

                    <div className="draft-room-progress" aria-label="Draft Room unlock progress">
                        <span>{secretCount >= SECRET_UNLOCK_TARGET ? 'Archive open' : 'Archive warming up'}</span>
                        <strong>{Math.min(secretCount, secretTotal)}</strong>
                        <em>of {secretTotal}</em>
                    </div>
                </div>

                <div className="draft-room-grid">
                    {draftCards.map((card) => (
                        <article key={card.title} className="draft-card">
                            <span>{card.tag}</span>
                            <h3>{card.title}</h3>
                            <p>{card.body}</p>
                        </article>
                    ))}
                </div>

                <div className="draft-room-fragments">
                    <div className="fragments-title">
                        <span>Recovered fragments</span>
                        <strong>{isBlueprintUnlocked ? 'Blueprint key active' : 'Keep exploring'}</strong>
                    </div>

                    <div className="fragment-list">
                        {discoveredItems.map((secret) => (
                            <div key={secret.id} className="fragment-item">
                                <span>{secret.shortLabel}</span>
                                <p>{secret.line}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DraftRoomOverlay;
