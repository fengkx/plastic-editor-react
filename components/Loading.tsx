import clsx from "clsx";

type PropsType = {
  style?: React.CSSProperties;
  className?: string;
};
export const Loading: React.FC<PropsType> = ({ style, className }) => {
  return (
    <>
      <style jsx>{`
        .loader,
        .loader:after {
          border-radius: 50%;
        }
        .loader {
          margin: 60px auto;
          font-size: 10px;
          position: relative;
          text-indent: -9999em;
          border-top: 1.1em solid rgba(64, 69, 79, 0.2);
          border-right: 1.1em solid rgba(64, 69, 79, 0.2);
          border-bottom: 1.1em solid rgba(64, 69, 79, 0.2);
          border-left: 1.1em solid white;
          -webkit-transform: translateZ(0);
          -ms-transform: translateZ(0);
          transform: translateZ(0);
          -webkit-animation: load8 1.1s infinite linear;
          animation: load8 1.1s infinite linear;
        }
        @-webkit-keyframes load8 {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }
        @keyframes load8 {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div className={clsx("loader", className)} style={style} />
    </>
  );
};
