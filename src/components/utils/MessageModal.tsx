import { useContext } from 'react'
import { PopupContext } from '~/components/Popup/Popup'
import useForestInput from '~/lib/useForestInput'
import { Card, CardBody, CardFooter, Heading, Paragraph, ResponsiveContext, TextInput } from 'grommet'
import { BoxColumn } from '~/components/BoxVariants'
import styles from '~/components/Popup/Popup.module.scss'
import PopupCardHeader from '~/components/Popup/PopupCardHeader'
import BackButton from '~/components/ActionButton/BackButton'
import MouseActionTerminator from '~/components/MouseActionTerminator'
import GoButton from '~/components/ActionButton/GoButton'

const pad = { horizontal: 'small', vertical: 'xsmall' };

export default function MessageModal({ heading, children, cancelLabel = 'Close' }) {
  const { popupState } = useContext(PopupContext);
  const size = useContext(ResponsiveContext);
  return (
    <BoxColumn fill align="center" justify="center">
      <MouseActionTerminator>
        <Card margin="large" background="background-back"
              width={size === 'large' ? { max: '800px', min: '50vw' } : '100%'}
              className={styles.popupCard}
        >
          {heading ? (<PopupCardHeader>
            <Heading justify="stretch" textAlign="center" color="text-reverse" level={2}>{heading}</Heading>
          </PopupCardHeader>) : null}
          <CardBody pad={pad} fill="horizontal">
            {children}
          </CardBody>
          <CardFooter justify="center">
            <GoButton onClick={popupState.do.hideModal}>{cancelLabel || 'Close'}</GoButton>
          </CardFooter>
        </Card>
      </MouseActionTerminator>
    </BoxColumn>
  )
}
