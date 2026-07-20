'use client'

// This has to be in a separate file for #95.
//  Make sure tsup outputs both files.

import * as React from 'react'
import NumberFlowLite, {
	type Value,
	type Format,
	type Props,
	renderInnerHTML,
	formatToData,
	type Data,
	prefersReducedMotion as _prefersReducedMotion,
	canAnimate as _canAnimate,
	define
} from 'number-flow/lite'
import { BROWSER } from 'esm-env'

const REACT_MAJOR = parseInt(React.version.match(/^(\d+)\./)?.[1]!)
const isReact19 = REACT_MAJOR >= 19

// Can't wait to not have to do this in React 19:
const OBSERVED_ATTRIBUTES = ['data', 'digits'] as const
type ObservedAttribute = (typeof OBSERVED_ATTRIBUTES)[number]
export class NumberFlowElement extends NumberFlowLite {
	static observedAttributes = isReact19 ? [] : OBSERVED_ATTRIBUTES
	attributeChangedCallback(attr: ObservedAttribute, _oldValue: string, newValue: string) {
		this[attr] = JSON.parse(newValue)
	}
}

define('number-flow-react', NumberFlowElement)

type BaseProps = React.HTMLAttributes<NumberFlowElement> &
	Partial<Props> & {
		isolate?: boolean
		willChange?: boolean
		onAnimationsStart?: (e: CustomEvent<undefined>) => void
		onAnimationsFinish?: (e: CustomEvent<undefined>) => void
	}

type NumberFlowImplProps = BaseProps & {
	innerRef: React.MutableRefObject<NumberFlowElement | undefined>
	group?: GroupContext
	data: Data
}

// You're supposed to cache these between uses:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
// Serialize to strings b/c React:
const formatters: Record<string, Intl.NumberFormat> = {}

// Tiny workaround to support React 19 until it's released:
function identity<T>(v: T) {
	return v
}
const serialize = isReact19 ? identity : JSON.stringify

function splitProps<T extends Record<string, any>>(
	props: T
): [Omit<Props, 'digits'>, Omit<T, keyof Omit<Props, 'digits'>>] {
	const {
		transformTiming,
		spinTiming,
		opacityTiming,
		animated,
		respectMotionPreference,
		trend,
		plugins,
		...rest
	} = props

	return [
		{
			transformTiming,
			spinTiming,
			opacityTiming,
			animated,
			respectMotionPreference,
			trend,
			plugins
		},
		rest
	]
}

type NumberFlowImplState = {}
type NumberFlowImplSnapshot = (() => void) | null // React doesn't like undefined
// We need a class component to use getSnapshotBeforeUpdate:
class NumberFlowImpl extends React.Component<
	NumberFlowImplProps,
	NumberFlowImplState,
	NumberFlowImplSnapshot
> {
	constructor(props: NumberFlowImplProps) {
		super(props)
		this.handleRef = this.handleRef.bind(this)
	}

	// Update the non-`data` props to avoid JSON serialization
	// Data needs to be set in render still:
	updateProperties(prevProps?: Readonly<NumberFlowImplProps>) {
		if (!this.el) return

		this.el.batched = !this.props.isolate
		const [nonData] = splitProps(this.props)
		Object.entries(nonData).forEach(([k, v]) => {
			// @ts-ignore
			this.el![k] = v ?? NumberFlowElement.defaultProps[k]
		})

		if (prevProps?.onAnimationsStart)
			this.el.removeEventListener('animationsstart', prevProps.onAnimationsStart as EventListener)
		if (this.props.onAnimationsStart)
			this.el.addEventListener('animationsstart', this.props.onAnimationsStart as EventListener)

		if (prevProps?.onAnimationsFinish)
			this.el.removeEventListener('animationsfinish', prevProps.onAnimationsFinish as EventListener)
		if (this.props.onAnimationsFinish)
			this.el.addEventListener('animationsfinish', this.props.onAnimationsFinish as EventListener)
	}

	override componentDidMount() {
		this.updateProperties()
		if (isReact19 && this.el) {
			// React 19 needs this because the attributeChangedCallback isn't called:
			this.el.digits = this.props.digits
			this.el.data = this.props.data
		}
	}

	override getSnapshotBeforeUpdate(prevProps: Readonly<NumberFlowImplProps>) {
		this.updateProperties(prevProps)
		if (prevProps.data !== this.props.data) {
			if (this.props.group) {
				this.props.group.willUpdate()
				return () => this.props.group?.didUpdate()
			}
			if (!this.props.isolate) {
				this.el?.willUpdate()
				return () => this.el?.didUpdate()
			}
		}
		return null
	}

	override componentDidUpdate(
		_: Readonly<NumberFlowImplProps>,
		__: NumberFlowImplState,
		didUpdate: NumberFlowImplSnapshot
	) {
		didUpdate?.()
	}

	private el?: NumberFlowElement

	handleRef(el: NumberFlowElement) {
		if (this.props.innerRef) this.props.innerRef.current = el
		this.el = el
	}

	override render() {
		const [
			_,
			{
				innerRef,
				className,
				data,
				nonce,
				willChange,
				isolate,
				group,
				digits,
				onAnimationsStart,
				onAnimationsFinish,
				...rest
			}
		] = splitProps(this.props)

		return (
			// @ts-expect-error missing types
			<number-flow-react
				ref={this.handleRef}
				data-will-change={willChange ? '' : undefined}
				// Have to rename this:
				class={className}
				nonce={nonce}
				{...rest}
				dangerouslySetInnerHTML={{
					__html: BROWSER ? '' : renderInnerHTML(data, { nonce, elementSuffix: '-react' })
				}}
				suppressHydrationWarning
				digits={serialize(digits)}
				// Make sure data is set last, everything else is updated:
				data={serialize(data)}
			/>
		)
	}
}

export type NumberFlowProps = BaseProps & {
	value: Value
	locales?: Intl.LocalesArgument
	format?: Format
	prefix?: string
	suffix?: string
}

const NumberFlow = React.forwardRef<NumberFlowElement, NumberFlowProps>(function NumberFlow(
	{ value, locales, format, prefix, suffix, ...props },
	_ref
) {
	React.useImperativeHandle(_ref, () => ref.current!, [])
	const ref = React.useRef<NumberFlowElement | undefined>(undefined)
	const group = React.useContext(NumberFlowGroupContext)
	group?.useRegister(ref)

	const localesString = React.useMemo(() => (locales ? JSON.stringify(locales) : ''), [locales])
	const formatString = React.useMemo(() => (format ? JSON.stringify(format) : ''), [format])
	const data = React.useMemo(() => {
		const formatter = (formatters[`${localesString}:${formatString}`] ??= new Intl.NumberFormat(
			locales,
			format
		))
		return formatToData(value, formatter, prefix, suffix)
	}, [value, localesString, formatString, prefix, suffix])

	return <NumberFlowImpl {...props} group={group} data={data} innerRef={ref} />
})

export default NumberFlow

// NumberFlowGroup

type GroupContext = {
	useRegister: (ref: React.MutableRefObject<NumberFlowElement | undefined>) => void
	willUpdate: () => void
	didUpdate: () => void
}

const NumberFlowGroupContext = React.createContext<GroupContext | undefined>(undefined)

export function NumberFlowGroup({ children }: { children: React.ReactNode }) {
	const flows = React.useRef(new Set<React.MutableRefObject<NumberFlowElement | undefined>>())
	const updating = React.useRef(false)
	const pending = React.useRef(new WeakMap<NumberFlowElement, boolean>())
	const value = React.useMemo<GroupContext>(
		() => ({
			useRegister(ref) {
				React.useEffect(() => {
					flows.current.add(ref)
					return () => {
						flows.current.delete(ref)
					}
				}, [])
			},
			willUpdate() {
				if (updating.current) return
				updating.current = true
				flows.current.forEach((ref) => {
					const f = ref.current
					if (!f || !f.created) return
					f.willUpdate()
					pending.current.set(f, true)
				})
			},
			didUpdate() {
				flows.current.forEach((ref) => {
					const f = ref.current
					if (!f || !pending.current.get(f)) return
					f.didUpdate()
					pending.current.delete(f)
				})
				updating.current = false
			}
		}),
		[]
	)

	return <NumberFlowGroupContext.Provider value={value}>{children}</NumberFlowGroupContext.Provider>
}
