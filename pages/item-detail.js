import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ItemDetail() {
  const router = useRouter();
  const [nftId, setNftId] = useState(0);
  useEffect(() => {
    if (router && router.query && router.query.id) {
      setNftId(router.query.id);
    }
  }, [router]);
  return (
    <div className="main-content flex justify-center">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex justify-center">
            <div className="item-model-container">
              <video autoPlay muted loop className="nft-video">
                <source src={`images/items/city_00${nftId}-small.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <div className="item_info">
            <h2 className="text-3xl text-black mb-3">Miami NFT {nftId}</h2>
            <p className="mb-5">Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec
              pellentesque iaculis elit
              sit amet facilisis. Nunc tincidunt rutrum tempor. Donec imperdiet dui at nibh porta placerat. Nam
              dapibus quis magna eu
              fermentum. Curabitur tempor orci et lorem maximus, eu aliquet sapien egestas. Maecenas feugiat egestas
              felis, ut
              consequat orci tempor sit amet.</p>
            <button className="btn-main"><span>Place a Bid</span></button>
          </div>
        </div>
      </div>
    </div>
  )
}