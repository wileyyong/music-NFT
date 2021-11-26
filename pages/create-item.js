/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Web3Modal from 'web3modal';
import { NotificationContainer, NotificationManager } from 'react-notifications';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress
} from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json';

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [musicFileUrl, setMusicFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' });
  const [loadingState, setLoadingState] = useState(false);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  async function createNotification(type, message='Message', title='Title') {
    switch (type) {
      case 'info':
        NotificationManager.info(message);
        break;
      case 'success':
        NotificationManager.success(message, title);
        break;
      case 'warning':
        NotificationManager.warning(message, title, 3000);
        break;
      case 'error':
        NotificationManager.error(message, 'Click me!', 5000, () => {
          alert('callback');
        });
        break;
    }
  }

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      if(!visible){
        setFileUrl(url)
      } else {
        setMusicFileUrl(url) 
      }
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function createMarket() {
    const { name, description, price } = formInput;
    var isValid = false;

    if (!name) {
      createNotification('warning', "Please input name field", "Field missed");
    } else if (!description) {
      createNotification('warning', "Please input description field", "Field missed");
    } else if (!price) {
      createNotification('warning', "Please input price field", "Field missed");
    } else if (!fileUrl) {
      createNotification('warning', "Please select file", "Field missed");
    } else {
      isValid = true;
    }

    //if (!name || !description || !price || !fileUrl) return;
    if (isValid) {
      /* first, upload to IPFS */
      const data = JSON.stringify({
        name, description, image: fileUrl, music: musicFileUrl
      });
      try {
        setLoadingState(true);
        const added = await client.add(data);
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
        createNotification('success', "Creating NFT Success", "Creating NFT");
        createSale(url);
      } catch (error) {
        console.log('Error uploading file: ', error);
        createNotification('error', "Creating NFT Failed", "Creating NFT");
      } finally {
        setLoadingState(false);
      }
    }
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    
    // next, create the item 
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();
    const price       = ethers.utils.parseUnits(formInput.price, 'ether');
    const commission  = String(price*0.25);
    try {
      // then list the item for sale on the marketplace
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();

      transaction = await contract.createMarketItem(nftaddress, tokenId, price, commission, { value: listingPrice });
      await transaction.wait();
      createNotification('success', "Creating Sale Success", "Creating Sale");
      router.push('/');
    } catch (error) {
      console.log(error)
      createNotification('error', "Creating Sale Failed", "Creating Sale");
    }
  }

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    if((value=='music') || (value=='3d')) {
      setVisible(true);
    }else{
      setVisible(false);
    }
  }
  return (
    <div className="main-content flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        {loadingState ? (<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>):(<div></div>)}
        <div className="mt-8" onChange={handleChange}>
          <input type="radio" value="art" name="nftType" defaultChecked/> Art Nft &nbsp;&nbsp;
          <input type="radio" value="music" name="nftType" /> Music Nft &nbsp;&nbsp;
          <input type="radio" value="3d" name="nftType" /> 3d Nft
        </div>

        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in GLZ"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        {
          !visible && <input
            type="file"
            name="Asset"
            className="my-4"
            accept="image/*"
            onChange={onChange}
          />
        }
        {
          visible && <input
            type="file"
            name="MusicFile"
            className="my-4"
            accept="video/*"
            onChange={onChange}
          />
        }
        {
          visible && <p>Select Music File</p>
        }
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={createMarket} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create Digital Asset
        </button>
      </div>
      <NotificationContainer/>
    </div>
  )
}