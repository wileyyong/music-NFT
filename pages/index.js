import { ethers } from 'ethers';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from "web3modal";

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'


const _nfts = [
  {
    id: 1,
    media: 'images/items/city_001-small.mp4',
    title: 'Miami NFT 1',
    price: '0.05 ETH',
    end_date: '30/11',
    likes: '97'
  },
  {
    id: 2,
    media: 'images/items/city_002-small.mp4',
    title: 'Miami NFT 2',
    price: '0.05 ETH',
    end_date: '30/11',
    likes: '97'
  },
  {
    id: 3,
    media: 'images/items/city_003-small.mp4',
    title: 'Miami NFT 3',
    price: '0.05 ETH',
    end_date: '30/11',
    likes: '97'
  },
  {
    id: 5,
    media: 'images/items/city_005-small.mp4',
    title: 'Miami NFT 5',
    price: '0.05 ETH',
    end_date: '30/11',
    likes: '97'
  },
  {
    id: 6,
    media: 'images/items/city_006-small.mp4',
    title: 'Miami NFT 6',
    price: '0.05 ETH',
    end_date: '30/11',
    likes: '97'
  },
  {
    id: 7,
    media: 'images/items/city_007-small.mp4',
    title: 'Miami NFT 7',
    price: '0.05 ETH',
    end_date: '30/11',
    likes: '97'
  },
  {
    id: 8,
    media: 'images/items/city_008-small.mp4',
    title: 'Miami NFT 8',
    price: '0.05 ETH',
    end_date: '30/11',
    likes: '97'
  },
  {
    id: 9,
    media: 'images/items/city_009-small.mp4',
    title: 'Miami NFT 9',
    price: '0.05 ETH',
    end_date: '30/11',
    likes: '97'
  }
];
// =======================

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  useEffect(() => {
    loadNFTs()
  }, []);
  
  async function loadNFTs() {
    setLoadingState(true);
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let commission = ethers.utils.formatUnits(i.commission.toString(), 'ether')
      console.log(price)
      console.log(commission)
      let item = {
        price,
        commission,
        itemId: i.itemId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        music: meta.data.music,
      }
      return item
    }))
    setNfts(items);
    setLoadingState(false);
  }
  async function buyNft(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    //const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const commission = ethers.utils.parseUnits(nft.commission.toString(), 'ether');
    const newPrice = ethers.utils.parseUnits((nft.price-nft.commission).toString(), 'ether');

    const transaction2 = await contract.createMarketSaleComission(nftaddress, nft.itemId, {
      value: commission
    });
    await transaction2.wait();

    const transaction = await contract.createMarketSale(nftaddress, nft.itemId, {
      value: newPrice
    });
    await transaction.wait();

    loadNFTs();
  }
  return (
    <div className="no-bottom no-top" id="content">
      <div id="section-hero" aria-label="section">
        <div className="v-center">
          <div className="container">
            <div className="grid">
              <div className="spacer-single"></div>
              <div className="grid md:grid-cols-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <img src="images/ddablack.png" alt="Miami DDA"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="section-collections">
        <div className="container">
          {
            loadingState ? (
              <div className="flex justify-center items-center w-100">
                <div
                  className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                  _nfts.length > 0 ? _nfts.map((nft, i) => (
                    <div className="nft__item style-2" key={i}>
                      <div className="nft__item_wrap">
                        <Link href={`/item-detail?id=${nft.id}`}>
                          <a>
                            <video autoPlay muted loop className="nft-video">
                              <source src={nft.media} type="video/mp4"/>
                              Your browser does not support the video tag.
                            </video>
                          </a>
                        </Link>
                      </div>
                      <div className="nft__item_info">
                        <Link href={`/item-detail?id=${nft.id}`}>
                          <a>
                            <h4>{nft.title}</h4>
                          </a>
                        </Link>
                        <div className="nft__item_price">
                          {nft.price}<span>{nft.end_date}</span>
                        </div>
                        <div className="nft__item_action">
                          <Link href={`/item-detail?id=${nft.id}`}>
                            <a>Place a bid</a>
                          </Link>
                        </div>
                        <div className="nft__item_like">
                          <i className="fa fa-heart"></i><span>{nft.likes}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <h2 className="flex text-3xl">
                      No items in marketplace
                    </h2>
                  )
                }
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}