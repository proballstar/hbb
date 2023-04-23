import React, { AnchorHTMLAttributes, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { api } from "~/utils/api";

interface GeoSphere {
  lat: number;
  lng: number;
}

interface TestAttributes {
  t: string;
  desc: string;
  pnds: number;
}

const Modal = ({ show, onClose }: { show: boolean; onClose: any;}) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [geo, setGeo] = useState<GeoSphere>({lat: 0, lng: 0})
  const [ta, setTa] = useState<TestAttributes>({t: '', desc: '', pnds: 0})
  const [f, setF] = useState<File | undefined>(undefined)
  const postMutation = api.post.create.useMutation()

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const handleCloseClick = (e: any) => {
    onClose();
  };
  
  function auto_loc() {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      }, err => console.error(err)
    )
  }

  async function addPost() {
    let a = "" as any
    var reader = new FileReader()

    reader.readAsDataURL(f!)
    reader.onload = () => {
      let a = reader.result
    }
    await postMutation.mutateAsync({
      content: ta.desc,
      latitude: geo.lat,
      longitude: geo.lng,
      title: ta.t,
      tokenWorth: ta.pnds,
      image: String(a)
    })
  }

  const modalContent = show ? (
    <StyledModalOverlay>
      <StyledModal>
        <StyledModalHeader>
          <a href="#" onClick={handleCloseClick}>
            x
          </a>
        </StyledModalHeader>
        <StyledModalBody>
            <input
               className="bg-gray-200 w-full rounded-lg shadow border p-2"
               placeholder="Item Title"
               onChange={e => setTa(prev => ({...prev, t: e.target.value}))}
               value={ta.t}
            />
            <input
               className="bg-gray-200 w-full rounded-lg shadow border p-2"
               placeholder="Item Title"
               onChange={e => setTa(prev => ({...prev, desc: e.target.value}))}
               value={ta.pnds}
            />
            <input
               className="bg-gray-200 w-full rounded-lg shadow border p-2"
               placeholder="Weight (lbs)"
               type="number"
               onChange={e => setTa(prev => ({...prev, pnds: parseInt(e.target.value)}))}
               value={ta.pnds}
            />
            <input
               className="bg-gray-200 w-full rounded-lg shadow border p-2"
               placeholder="Weight (lbs)"
               type="file"
               multiple={false}
               onChange={e => setF(e.target.files![0])}
            />
            <textarea
               className="bg-gray-200 w-full rounded-lg shadow border p-2"
               rows={5}
               placeholder="Item Description"
               onChange={val => setTa(prev => ({...prev, desc: val.target.value}))}
               value={ta.desc}
            />
            {JSON.stringify(geo)}
            {JSON.stringify(ta)}
            <button onClick={auto_loc}>
                Autocomplete Location
            </button>
            <button onClick={addPost}>
              Submit
            </button>
        </StyledModalBody>
      </StyledModal>
    </StyledModalOverlay>
  ) : null;

  if (isBrowser) {
    return ReactDOM.createPortal(
      modalContent,
      document.getElementById("modal-root")!
    );
  } else {
    return null;
  }
};

const StyledModalBody = styled.div`
  padding-top: 10px;
`;

const StyledModalHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  font-size: 25px;
`;

const StyledModal = styled.div`
  background: white;
  width: 500px;
  height: 600px;
  border-radius: 15px;
  padding: 15px;
`;
const StyledModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

export default Modal;