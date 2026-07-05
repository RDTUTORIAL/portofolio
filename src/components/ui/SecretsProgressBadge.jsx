import { useSecrets } from '../../context/SecretsContext';

const SecretsProgressBadge = () => {
  const { secretCount, secretTotal, isBlueprintUnlocked } = useSecrets();

  return (
    <div
      className={`secrets-progress-badge ${isBlueprintUnlocked ? 'unlocked' : ''}`}
      aria-label={`${secretCount} of ${secretTotal} secrets found`}
    >
      <span className="label">Secrets</span>
      <span className="value">{secretCount}/{secretTotal}</span>
    </div>
  );
};

export default SecretsProgressBadge;
