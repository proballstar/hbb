import { useAuth } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
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
  pnds: string;
}

const Modal = ({ show, onClose }: { show: boolean; onClose: () => any }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [geo, setGeo] = useState<GeoSphere>({ lat: 0, lng: 0 });
  const [ta, setTa] = useState<TestAttributes>({ t: "", desc: "", pnds: "" });
  const postMutation = api.post.create.useMutation();

  const auth = useAuth();

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const handleCloseClick = (e: any) => {
    onClose();
  };

  function auto_loc() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error(err)
    );
  }

  async function addPost() {
    await postMutation.mutateAsync({
      content: ta.desc,
      latitude: geo.lat,
      longitude: geo.lng,
      title: ta.t,
      tokenWorth: parseInt(ta.pnds, 10),
      userId: auth.userId!,
    });
    window.location.reload();
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
            className="w-full rounded-lg border bg-gray-200 p-2 shadow"
            placeholder="Item Title"
            onChange={(e) => setTa((prev) => ({ ...prev, t: e.target.value }))}
            value={ta.t}
          />
          <input
            className="w-full rounded-lg border bg-gray-200 p-2 shadow"
            placeholder="Weight (lbs)"
            type="text"
            onChange={(e) =>
              setTa((prev) => ({ ...prev, pnds: e.target.value }))
            }
            value={ta.pnds}
          />
          <textarea
            className="w-full rounded-lg border bg-gray-200 p-2 shadow"
            rows={5}
            placeholder="Item Description"
            onChange={(val) =>
              setTa((prev) => ({ ...prev, desc: val.target.value }))
            }
            value={ta.desc}
          />
          <div className="flex flex-col">
            <button className="px-5 py-2 text-white bg-red-500 rounded-md shadow-md border border-gray-600" onClick={auto_loc}>Autocomplete Location</button> {"\n"}
            <button className="px-5 py-2 text-white bg-blue-500 rounded-md shadow-md border border-gray-600" onClick={() => void addPost()}>Submit</button>
          </div>
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
