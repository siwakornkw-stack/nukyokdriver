
import { Button } from "@mui/material";
import classNames from "classnames";
import React, {
	CSSProperties,
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";


interface SweetAlertProps {
	show?: boolean;
	animateIn?: string;
	animateOut?: string;
	className?: string;
	style?: CSSProperties;
	onToggle?: (show: boolean) => void;
}

export interface SweetAlertHandle {
	open: (option?: Partial<SweetAlertOptions>) => Promise<SweetAlertResolver>;
	close: () => void;
	toggle: (
		option?: Partial<SweetAlertOptions>
	) => Promise<SweetAlertResolver> | null;
}

export interface SweetAlertOptions {
	icon: string | null;
	type: string | null;
	title: string | null;
	text: string | null;
	html: React.ReactNode | null;
	showConfirmButton: boolean;
	showCancelButton: boolean;
	confirmText: string;
	cancelText: string;
	custom: React.ReactNode | null;
	timer: number | null;
}

export interface SweetAlertResolver {
	dismiss: string;
	isConfirmed: boolean;
}

const SweetAlert = forwardRef<SweetAlertHandle, SweetAlertProps>(
	(
		{
			show: _show,
			animateIn: _animIn,
			animateOut: _animOut,
			className,
			style,
			onToggle,
		},
		ref
	) => {
		const defaultOption: SweetAlertOptions = {
			icon: null,
			type: null,
			title: null,
			html: null,
			text: null,
			showConfirmButton: true,
			showCancelButton: true,
			confirmText: "ตกลง",
			cancelText: "ยกเลิก",
			custom: null,
			timer: null,
		};

		const [resolver, setResolver] = useState<any>(null);
		const [timeout, __setTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
		const [show, setShow] = useState<boolean>(false);
		const [unseen, setUnseen] = useState<boolean>(true);
		const [options, setOptions] =
			useState<SweetAlertOptions>(defaultOption);
		const modalRef = useRef<HTMLDivElement>(null);
		const backdropRef = useRef<HTMLDivElement>(null);
		const animateIn = _animIn || "animate__bounceIn";
		const animateOut = _animOut || "animate__bounceOut";

		const __show = _show !== null ? _show : show;

		const handleOpen = useCallback(
			(option?: Partial<SweetAlertOptions>) => {
				console.log('Opening modal with options:', option);

				// เพิ่มการ set show และ unseen ทันที
				setShow(true);
				setUnseen(false);

				const newOption = Object.assign({}, defaultOption, option);
				setOptions(newOption);

				return new Promise<SweetAlertResolver>((resolve) => {
					setResolver(() => resolve);

					if (timeout) {
						clearTimeout(timeout);
						__setTimeout(null);
					}

					if (onToggle) onToggle(true);
				});
			},
			[onToggle]
		);

		const handleClose = useCallback(() => {
			const backdrop = backdropRef.current;
			if (backdrop) {
				backdrop.classList.add('hide');
			}

			setShow(false);

			setTimeout(() => {
				setUnseen(true);
				if (onToggle) onToggle(false);
			}, 300);
		}, [onToggle]);

		const handleToggle = useCallback(
			(option?: Partial<SweetAlertOptions>) => {
				setShow(!__show);

				if (!__show) {
					const newOption = Object.assign({}, defaultOption, option);
					setOptions(newOption);

					return new Promise<SweetAlertResolver>((resolve) => {
						setResolver(resolve);
						if (onToggle) onToggle(true);
					});
				}

				if (onToggle) onToggle(false);
				return null;
			},
			[__show, onToggle]
		);

		useImperativeHandle(
			ref,
			() => ({
				open(option) {
					return handleOpen(option);
				},
				close() {
					handleClose();
				},
				toggle(option) {
					return handleToggle(option);
				},
			}),
			[handleClose, handleOpen, handleToggle]
		);

		const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
			const target = e.target;

			if (target instanceof HTMLElement) {
				const wrapper = target.closest(".swal-wrapper");
				if (!wrapper && target.classList.contains("swal-modal")) {
					handleClose();
					if (resolver) {
						resolver({ dismiss: "backdrop", isConfirmed: false });
						setResolver(null);
					}
				}
			}
		}, [handleClose, resolver]);

		const handleUpdate = useCallback(() => {
			const modal = modalRef.current;
			if (!modal) return;

			if (!show && modal.classList.contains(animateOut)) {
				setTimeout(() => {
					setUnseen(true);
				}, 300);
			}
		}, [show, animateOut]);


		const onCancel = () => {
			handleClose();
			if (resolver) {
				resolver({ dismiss: "cancel", isConfirmed: false });
				setResolver(null);
			}
			clearTimer();
		};

		const onConfirm = () => {
			handleClose();
			if (resolver) {
				resolver({ dismiss: "confirm", isConfirmed: true });
				setResolver(null);
			}
			clearTimer();
		};

		const clearTimer = () => {
			if (!timeout) return;

			clearTimeout(timeout);
			__setTimeout(() => null);
		};

		useEffect(() => {
			const modal = modalRef.current;
			if (modal) {
				modal.addEventListener("animationend", handleUpdate);
				modal.addEventListener("webkitAnimationEnd", handleUpdate);
				modal.addEventListener("oAnimationEnd", handleUpdate);
				modal.addEventListener("MSAnimationEnd", handleUpdate);

				return () => {
					modal.removeEventListener("animationend", handleUpdate);
					modal.removeEventListener(
						"webkitAnimationEnd",
						handleUpdate
					);
					modal.removeEventListener("oAnimationEnd", handleUpdate);
					modal.removeEventListener("MSAnimationEnd", handleUpdate);
				};
			}
		}, []);

		const {
			icon,
			title,
			html,
			text,
			confirmText,
			cancelText,
			showConfirmButton,
			showCancelButton,
			custom,
		} = options;

		return (
			<React.Fragment>
				<div
					ref={backdropRef}
					className={classNames("swal-backdrop", {
						show: show,
						hide: !show
					})}
				/>

				<div
					ref={modalRef}
					className={classNames("swal-modal", {
						[animateIn]: show,
						[animateOut]: !show,
						"d-none": unseen,
					})}
					onClick={handleBackdropClick}
					onKeyDown={(e) => {
						if (e.key === 'Escape') {
							handleBackdropClick(e as unknown as React.MouseEvent<HTMLElement>);
						}
					}}
					role="button"
					tabIndex={0}
				>
					<div
						className={classNames("swal-wrapper", className)}
						style={style}
					>
						{title ? (
							<div
								dangerouslySetInnerHTML={{ __html: title }}
								className="swal-title"
							/>
						) : null}

						{icon && (
							<div className="swal-icon">
								<img src={icon} alt="swal logo" />
							</div>
						)}

						{html ? (
							html
						) : null}

						{text ? (
							<div
								dangerouslySetInnerHTML={{ __html: text }}
								className="swal-text"
							/>
						) : null}

						{custom}

						{(showConfirmButton || showCancelButton) && (
							<div className="swal-btn-wrapper">
								{showCancelButton && (
									<Button variant="contained" onClick={onCancel} className="swal-btn" color="error">
									  {cancelText}
								  </Button>
								)}

								{showConfirmButton && (
									<Button variant="contained" onClick={onConfirm} className="swal-btn" color="success">
									  {confirmText}
								  </Button>
								)}
							</div>
						)}
					</div>
				</div>
			</React.Fragment>
		);
	}
);

SweetAlert.displayName = "SweetAlert";

export default SweetAlert;
