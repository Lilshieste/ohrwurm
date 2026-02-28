const { parse } = require('../../nsf/parser');

const createPlayer = () => {
  let metadata = null;

  const loadFile = async (url) => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);

    metadata = parse(data);
    return metadata;
  };

  const getMetadata = () => metadata;

  return {
    loadFile,
    getMetadata,
  };
};

window.createPlayer = createPlayer;
