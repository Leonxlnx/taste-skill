// A logo row is a static list and needs no animation controller. Preserve the legacy component mount interface.
export default function init() { return { destroy() {} }; }
