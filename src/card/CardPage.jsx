import { createElement, useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  GithubLogo,
  InstagramLogo,
  ShareNetwork,
  TelegramLogo,
  WarningCircle,
  WhatsappLogo,
} from '@phosphor-icons/react';

const profileLinks = [
  {
    label: 'GitHub',
    detail: '@RDTUTORIAL',
    href: 'https://github.com/RDTUTORIAL',
    icon: GithubLogo,
  },
  {
    label: 'WhatsApp',
    detail: 'Direct message',
    href: 'https://wa.me/6287856053716',
    icon: WhatsappLogo,
  },
  {
    label: 'Instagram',
    detail: '@kd.dnswra',
    href: 'https://www.instagram.com/kd.dnswra/',
    icon: InstagramLogo,
  },
  {
    label: 'Telegram',
    detail: '@justinexx666',
    href: 'https://t.me/justinexx666',
    icon: TelegramLogo,
  },
];

const shareLabels = {
  idle: 'Share',
  working: 'Opening',
  shared: 'Shared',
  copied: 'Copied',
  error: 'Try again',
};

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();

  if (!copied) {
    throw new Error('Copy command failed');
  }
}

function CardPage() {
  const [shareState, setShareState] = useState('idle');
  const resetTimer = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(resetTimer.current);
  }, []);

  const settleShareState = (nextState) => {
    window.clearTimeout(resetTimer.current);
    setShareState(nextState);
    resetTimer.current = window.setTimeout(() => setShareState('idle'), 2200);
  };

  const handleShare = async () => {
    if (shareState === 'working') return;

    setShareState('working');
    const shareData = {
      title: 'Danis | Creative Software Engineer',
      text: 'Web engineering, AI, cybersecurity, IoT, and embedded systems.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        settleShareState('shared');
        return;
      }

      await copyText(shareData.url);
      settleShareState('copied');
    } catch (error) {
      if (error?.name === 'AbortError') {
        setShareState('idle');
        return;
      }

      try {
        await copyText(shareData.url);
        settleShareState('copied');
      } catch {
        settleShareState('error');
      }
    }
  };

  const shareSucceeded = shareState === 'shared' || shareState === 'copied';
  const ShareIcon = shareSucceeded
    ? Check
    : shareState === 'error'
      ? WarningCircle
      : ShareNetwork;

  const liveMessage = shareState === 'shared'
    ? 'Share sheet completed.'
    : shareState === 'copied'
      ? 'Card link copied.'
      : shareState === 'error'
        ? 'The card link could not be copied. Try again.'
        : '';

  return (
    <div className="card-page">
      <a className="card-skip-link" href="#profile-links">
        Skip to profile links
      </a>

      <main className="card-sheet" aria-labelledby="card-name">
        <header className="card-toolbar" aria-label="Card actions">
          <button
            className={`card-share card-share--${shareState}`}
            type="button"
            onClick={handleShare}
            disabled={shareState === 'working'}
            aria-label={`${shareLabels[shareState]} this profile card`}
          >
            <ShareIcon size={19} weight="bold" aria-hidden="true" />
            <span>{shareLabels[shareState]}</span>
          </button>
          <span className="card-live-region" aria-live="polite" aria-atomic="true">
            {liveMessage}
          </span>
        </header>

        <div>
          <section className="card-profile" aria-label="Danis profile">
            <div className="card-profile__accent" aria-hidden="true" />
            <img
              className="card-profile__avatar"
              src="/textures/entrance/avatar_window.webp"
              width="1024"
              height="1024"
              alt="Hand-drawn illustration of Danis waving"
              decoding="async"
              fetchPriority="high"
            />

            <div className="card-profile__identity">
              <h1 id="card-name">DANIS</h1>
              <p className="card-profile__role">Creative Software Engineer</p>
            </div>

            <p className="card-profile__bio">
              Web engineering at the core, with curiosity stretching into AI, cybersecurity,
              IoT, and embedded systems.
            </p>

            <a className="card-primary-action" href="/">
              <span>Explore portfolio</span>
              <ArrowUpRight size={21} weight="bold" aria-hidden="true" />
            </a>
          </section>

          <section className="card-links" id="profile-links" aria-labelledby="profile-links-title">
            <h2 id="profile-links-title">Find me online</h2>

            <div className="card-link-list">
              {profileLinks.map(({ label, detail, href, icon }) => (
                <a
                  className="card-link-row"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={label}
                >
                  {createElement(icon, {
                    className: 'card-link-row__icon',
                    size: 25,
                    weight: 'regular',
                    'aria-hidden': true,
                  })}
                  <span className="card-link-row__copy">
                    <strong>{label}</strong>
                    <span>{detail}</span>
                  </span>
                  <ArrowUpRight
                    className="card-link-row__arrow"
                    size={20}
                    weight="bold"
                    aria-hidden="true"
                  />
                  <span className="card-visually-hidden">Opens in a new tab</span>
                </a>
              ))}
            </div>
          </section>

          <aside className="card-story" aria-label="A note from Danis">
            <p>
              I started coding in grade 6, and kept turning curiosity into real systems.
            </p>
            <img
              src="/textures/about/awatarnachmurce.webp"
              width="1781"
              height="890"
              loading="lazy"
              decoding="async"
              alt="Hand-drawn illustration of Danis relaxing on a cloud"
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CardPage;
