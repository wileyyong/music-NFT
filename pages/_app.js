import '../styles/globals.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function Marketplace({ Component, pageProps }) {
  const [scrollTop, setScrollTop] = useState(0);
  useEffect(() => {
    const onScroll = e => {
      setScrollTop(e.target.documentElement.scrollTop);
      if (scrollTop > 50) {
        document.getElementById('back-to-top').classList.add('show');
        document.getElementById('back-to-top').classList.remove('hide');
        document.getElementById('nav-header').classList.add('leave');
      } else {
        document.getElementById('back-to-top').classList.add('hide');
        document.getElementById('back-to-top').classList.remove('show');
        document.getElementById('nav-header').classList.remove('leave');
      }
    };
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollTop]);
  const onToggle = () => {
    if (!document.querySelector('.collapsed')) {
      document.querySelector('body')?.classList.add('collapsed');
    } else {
      document.querySelector('body')?.classList.remove('collapsed');
    }
  }
  return (
    <div id="layout">
      <header id="nav-header">
        <div className="container">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex">
                <div id="logo">
                  <Link href="/">
                    <a>
                      <img alt="logo" src="images/miamidda.png" />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="flex">
                <input id="quick_search" className="xs-hide form-input" name="quick_search" placeholder="search item here..."
                  type="text" />
              </div>
            </div>
            <div className="flex items-center">
              <ul id="mainmenu" className="flex">
                <li>
                  <Link href="/">
                    <a onClick={() => onToggle()}>Explore<span /></a>
                  </Link>
                </li>
                <li>
                <Link href="/create-item">
                  <a onClick={() => onToggle()}>
                    Sell Digital Asset<span />
                  </a>
                </Link>
                </li>
                <li>
                  <Link href="/login">
                    <a onClick={() => onToggle()}>Login<span /></a>
                  </Link>
                </li>
              </ul>
              <div className="flex items-center">
                <button type="button" className="btn-main"><i className="fa fa-google-wallet"></i><span>Connect Wallet</span></button>
                <button className="toggle ml-2" onClick={() => onToggle()}>
                  <div></div>
                  <div></div>
                  <div></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Component {...pageProps} />
      <div id="back-to-top" onClick={() => {
        document.documentElement.scrollTo({
          // @ts-ignore
          top: 0,
          behavior: "smooth",
        });
      }}></div>
      <footer>
        <div className="subfooter">
          <div className="container">
            <div className="flex flex-wrap justify-between items-center">
              <Link href="/">
                <a className="flex my-2">
                  <span className="copy">&copy; Copyright 2021 - RKG Creative, 2021</span>
                </a>
              </Link>
              <div className="flex">
                <div className="social-icons">
                  <a href="#" target="_blank"><i className="fa fa-facebook fa-lg"></i></a>
                  <a href="#" target="_blank"><i className="fa fa-twitter fa-lg"></i></a>
                  <a href="#" target="_blank"><i className="fa fa-linkedin fa-lg"></i></a>
                  <a href="#" target="_blank"><i className="fa fa-pinterest fa-lg"></i></a>
                  <a href="#" target="_blank"><i className="fa fa-rss fa-lg"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Marketplace;